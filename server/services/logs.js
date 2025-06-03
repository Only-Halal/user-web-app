const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multerS3 = require("multer-s3");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { transporter } = require("./mail");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateSignedUrl = async (filename) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "onlyhalalbucket",
      Key: `api_logs/only-halal/${filename}`,
    });
    return await getSignedUrl(s3, command, { expiresIn: 604800 });
  } catch (error) {
    console.error("❌ Failed to generate signed URL:", error);
    throw new Error("S3 URL generation failed");
  }
};

const generateEmailTemplate = (filename, signedUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #F8971D; padding: 20px; color: white; text-align: center;">
      <h1>Only Halal - Error Log Notification</h1>
    </div>
    <div style="padding: 20px;">
      <p>Hello,</p>
      <p>A new error log has been uploaded:</p>
      <p><strong>File:</strong> ${filename}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <a href="${signedUrl}" 
         style="display: inline-block; margin: 15px 0; padding: 10px 15px; 
                background-color: #F8971D; color: white; text-decoration: none;">
        Download Log File
      </a>
      <p><small>Link expires in 7 days</small></p>
    </div>
    <div style="background-color: #f5f5f5; padding: 10px; text-align: center;">
      <p>© ${new Date().getFullYear()} Only Halal. All rights reserved.</p>
    </div>
  </div>
`;

const sendToMultipleRecipients = async (filename) => {
  const recipients = process.env.NOTIFICATION_RECIPIENTS
    ? process.env.NOTIFICATION_RECIPIENTS.split(",").map((email) =>
        email.trim()
      )
    : ["nighthawk.og01@gmail.com"];

  if (recipients.length === 0) {
    console.warn("⚠️ No recipients configured");
    return { success: false, error: "No recipients configured" };
  }

  try {
    const signedUrl = await generateSignedUrl(filename);
    const template = generateEmailTemplate(filename, signedUrl);

    const emailPromises = recipients.map(async (recipient) => {
      try {
        const info = await transporter.sendMail({
          from: `Only Halal System <${process.env.EMAIL}>`,
          to: recipient,
          subject: `Error Log: ${filename}`,
          html: template,
          headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
          },
        });

        console.log(`✅ Email sent to ${recipient}`, info.messageId);
        return { success: true, recipient, messageId: info.messageId };
      } catch (error) {
        console.error(`❌ Failed to send to ${recipient}:`, error.message);
        return { success: false, recipient, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return {
      total: recipients.length,
      successful: successful.length,
      failed: failed.length,
      failedRecipients: failed.map((f) => f.recipient),
      messageIds: successful.map((s) => s.messageId),
    };
  } catch (error) {
    console.error("❌ Critical error in email sending:", error);
    return {
      success: false,
      error: error.message,
      total: recipients.length,
      successful: 0,
      failed: recipients.length,
    };
  }
};

const logStorage = multerS3({
  s3: s3,
  bucket: "onlyhalalbucket",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const filePath = `api_logs/${file.originalname}`;
    console.log(`Uploading error log to S3: ${filePath}`);
    cb(null, filePath);
  },
});

const uploadLog = multer({ storage: logStorage }).single("logFile");

const logErrorToS3 = async (apiName, error, req) => {
  let filePath;

  try {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const filename = `${apiName}_error_${timestamp}.log`;
    const logsDir = path.join(__dirname, "api_logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    filePath = path.join(logsDir, filename);

    fs.writeFileSync(
      filePath,
      `\
[${new Date().toISOString()}]
API: ${apiName}
Error: ${error.stack || error.message}
Request Body: ${JSON.stringify(req.body, null, 2)}
`
    );

    console.log(`🚀 Uploading ${filename} to S3...`);

    const uploadParams = {
      Bucket: "onlyhalalbucket",
      Key: `api_logs/only-halal/${filename}`,
      Body: fs.createReadStream(filePath),
      ContentType: "text/plain",
    };

    await s3.send(new PutObjectCommand(uploadParams));
    console.log("✅ Upload Successful!");
    await sendToMultipleRecipients(filename);
  } catch (err) {
    console.error("❌ Failed to upload log to S3:", err);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error("❌ Failed to delete local log file:", unlinkError);
      }
    }
  }
};

module.exports = { uploadLog, logErrorToS3 };

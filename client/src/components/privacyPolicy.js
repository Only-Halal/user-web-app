import { useState } from "react";
import { Colors, Fonts, Sizes } from "../constants/styles.js";

const PrivacyPolicy = ({ handleCheck, privacyPolicy }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 20;
    setIsScrolledToBottom(isBottom);
  };

  const effectiveDate = new Date().toLocaleDateString("en-GB");

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: Sizes.regularPadding,
      }}
    >
      <div
        style={{
          height: "400px",
          overflowY: "auto",
          padding: Sizes.regularPadding,
          backgroundColor: Colors.lightBackground,
          borderRadius: Sizes.borderRadius,
          border: `1px solid ${Colors.borderColor}`,
          marginBottom: Sizes.largeMargin,
        }}
        onScroll={handleScroll}
      >
        <h1
          style={{
            fontSize: Sizes.largeText,
            fontFamily: Fonts.bold,
            marginBottom: Sizes.regularMargin,
          }}
        >
          Privacy Policy for Only Halal
        </h1>

        <p
          style={{
            fontSize: Sizes.smallText,
            fontFamily: Fonts.regular,
            marginBottom: Sizes.regularMargin,
          }}
        >
          <span style={{ fontFamily: Fonts.bold }}>Effective Date:</span>{" "}
          {effectiveDate}
        </p>

        <h2
          style={{
            fontSize: Sizes.mediumText,
            fontFamily: Fonts.bold,
            margin: `${Sizes.regularMargin} 0 ${Sizes.smallMargin} 0`,
          }}
        >
          1. Introduction
        </h2>
        <p
          style={{
            fontSize: Sizes.smallText,
            fontFamily: Fonts.regular,
            marginBottom: Sizes.regularMargin,
          }}
        >
          Welcome to Only Halal ("we," "our," "us"). Your privacy is important
          to us. This Privacy Policy explains how we collect, use, store, and
          protect your personal information when you use our food delivery
          application.
        </p>

        {/* Continue with all other sections using the same pattern */}

        <h2
          style={{
            fontSize: Sizes.mediumText,
            fontFamily: Fonts.bold,
            margin: `${Sizes.regularMargin} 0 ${Sizes.smallMargin} 0`,
          }}
        >
          11. Contact Us
        </h2>
        <p
          style={{
            fontSize: Sizes.smallText,
            fontFamily: Fonts.regular,
          }}
        >
          If you have any questions or concerns about this Privacy Policy,
          please contact us at{" "}
          <span style={{ fontFamily: Fonts.bold }}>privacy@only-halal.com</span>
        </p>
      </div>

      {isScrolledToBottom && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: Sizes.largeMargin,
            padding: Sizes.regularPadding,
            backgroundColor: Colors.lightBackground,
            borderRadius: Sizes.borderRadius,
          }}
        >
          <input
            type="checkbox"
            checked={privacyPolicy}
            onChange={handleCheck}
            style={{
              width: "18px",
              height: "18px",
              marginRight: Sizes.smallMargin,
              cursor: "pointer",
              accentColor: Colors.secondaryColor,
            }}
          />
          <span
            style={{
              fontSize: Sizes.smallText,
              fontFamily: Fonts.semiBold,
            }}
          >
            By using Only Halal, you agree to this Privacy Policy
          </span>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;

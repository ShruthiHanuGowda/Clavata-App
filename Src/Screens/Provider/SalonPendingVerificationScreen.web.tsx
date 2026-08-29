
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function SalonPendingVerificationScreen() {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('authScreens');
    }
  };

  const handleBackToLogin = () => {
    navigation.replace('LoginScreen', {
      mode: 'SIGN_IN',
      phoneNumber: '',
      hideBackButton: true,
    });
  };

  return (
    <div style={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button
            type="button"
            onClick={handleBack}
            style={styles.backButton}
            aria-label="Go back"
          >
            <span style={styles.backIcon}>‹</span>
          </button>

          <div style={styles.headerTitle}>
            Verification Status
          </div>

          <div style={styles.headerSpacer} />
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main style={styles.main}>
        <section style={styles.card}>

          {/* =================================================
              ICON
          ================================================= */}
          <div style={styles.iconOuter}>
            <div style={styles.iconInner}>
              <div style={styles.clockCircle}>
                <div style={styles.clockHandVertical} />
                <div style={styles.clockHandHorizontal} />
              </div>
            </div>
          </div>

          {/* =================================================
              STATUS
          ================================================= */}
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />

            <span style={styles.statusText}>
              VERIFICATION IN PROGRESS
            </span>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}
          <h1 style={styles.title}>
            Your salon is under review
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}
          <p style={styles.description}>
            We've received your salon registration and KYC
            documents successfully.
          </p>

          <p style={styles.description}>
            Our team is currently reviewing your business
            information and documents.
          </p>

          {/* =================================================
              INFORMATION CARD
          ================================================= */}
          <div style={styles.infoCard}>
            <div style={styles.infoIconContainer}>
              <span style={styles.infoIcon}>i</span>
            </div>

            <div style={styles.infoContent}>
              <div style={styles.infoTitle}>
                What happens next?
              </div>

              <div style={styles.infoText}>
                Once your verification is complete, you'll be
                able to access your salon dashboard and start
                managing your services and bookings.
              </div>
            </div>
          </div>

          {/* =================================================
              NOTE
          ================================================= */}
          <p style={styles.note}>
            We'll notify you once your salon has been approved.
          </p>

          {/* =================================================
              BUTTON
          ================================================= */}
          <button
            type="button"
            onClick={handleBackToLogin}
            style={styles.loginButton}
          >
            Back to Login
          </button>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}
        <div style={styles.footer}>
          <span>Clavata</span>
          <span style={styles.footerDot}>•</span>
          <span>Secure verification</span>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   WEB STYLES
   ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#F8FAFC',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: '#123B52',
    boxSizing: 'border-box',
  },

  /* ==========================================================
     HEADER
     ========================================================== */

  header: {
    width: '100%',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E7EDF1',
    boxSizing: 'border-box',
  },

  headerInner: {
    width: '100%',
    maxWidth: 1180,
    height: 70,
    margin: '0 auto',
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },

  backButton: {
    width: 42,
    height: 42,
    border: 'none',
    borderRadius: 21,
    backgroundColor: '#F5F8FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },

  backIcon: {
    fontSize: 31,
    lineHeight: '32px',
    fontWeight: 300,
    color: '#009D94',
    marginTop: -2,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: '22px',
    fontWeight: 600,
    color: '#123B52',
  },

  headerSpacer: {
    width: 42,
    flexShrink: 0,
  },

  /* ==========================================================
     MAIN
     ========================================================== */

  main: {
    width: '100%',
    minHeight: 'calc(100vh - 70px)',
    padding: '55px 24px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
  },

  /* ==========================================================
     CARD
     ========================================================== */

  card: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E3EAEE',
    borderRadius: 24,
    padding: '42px 48px 42px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 18px 50px rgba(18, 59, 82, 0.07)',
  },

  /* ==========================================================
     ICON
     ========================================================== */

  iconOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(0, 157, 148, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0, 157, 148, 0.20)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clockCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    border: '3px solid #009D94',
    position: 'relative',
    boxSizing: 'border-box',
  },

  clockHandVertical: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: '#009D94',
    left: 19,
    top: 7,
    borderRadius: 2,
  },

  clockHandHorizontal: {
    position: 'absolute',
    width: 11,
    height: 3,
    backgroundColor: '#009D94',
    left: 19,
    top: 20,
    borderRadius: 2,
    transform: 'rotate(35deg)',
    transformOrigin: 'left center',
  },

  /* ==========================================================
     STATUS BADGE
     ========================================================== */

  statusBadge: {
    marginTop: 24,
    padding: '9px 16px',
    borderRadius: 30,
    backgroundColor: 'rgba(0, 157, 148, 0.08)',
    border: '1px solid rgba(0, 157, 148, 0.16)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: '#009D94',
    marginRight: 9,
  },

  statusText: {
    fontSize: 10,
    lineHeight: '13px',
    fontWeight: 700,
    letterSpacing: 0.8,
    color: '#009D94',
  },

  /* ==========================================================
     TITLE
     ========================================================== */

  title: {
    margin: '22px 0 0',
    padding: 0,
    fontSize: 28,
    lineHeight: '36px',
    fontWeight: 600,
    color: '#123B52',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  /* ==========================================================
     DESCRIPTION
     ========================================================== */

  description: {
    maxWidth: 500,
    margin: '13px 0 0',
    padding: 0,
    fontSize: 15,
    lineHeight: '23px',
    fontWeight: 400,
    color: '#667781',
    textAlign: 'center',
  },

  /* ==========================================================
     INFORMATION CARD
     ========================================================== */

  infoCard: {
    width: '100%',
    marginTop: 30,
    padding: 20,
    borderRadius: 16,
    border: '1px solid #E3EAEE',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    boxSizing: 'border-box',
  },

  infoIconContainer: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 157, 148, 0.10)',
    border: '1px solid rgba(0, 157, 148, 0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    boxSizing: 'border-box',
  },

  infoIcon: {
    fontSize: 16,
    lineHeight: '18px',
    fontWeight: 700,
    color: '#009D94',
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoTitle: {
    fontSize: 15,
    lineHeight: '21px',
    fontWeight: 600,
    color: '#123B52',
  },

  infoText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: '21px',
    fontWeight: 400,
    color: '#667781',
  },

  /* ==========================================================
     NOTE
     ========================================================== */

  note: {
    margin: '22px 0 0',
    padding: '0 10px',
    fontSize: 13,
    lineHeight: '20px',
    color: '#667781',
    textAlign: 'center',
  },

  /* ==========================================================
     BUTTON
     ========================================================== */

  loginButton: {
    width: '100%',
    height: 52,
    marginTop: 28,
    border: 'none',
    borderRadius: 12,
    backgroundColor: '#009D94',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxSizing: 'border-box',
  },

  /* ==========================================================
     FOOTER
     ========================================================== */

  footer: {
    marginTop: 28,
    fontSize: 12,
    lineHeight: '18px',
    color: '#8A989F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerDot: {
    margin: '0 7px',
    color: '#B5C0C5',
  },
};


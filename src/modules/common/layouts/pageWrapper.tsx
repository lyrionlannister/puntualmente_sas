import { motion, type Variants } from "framer-motion";
import Navbar from "../components/navbar";
import Banner from "../components/banner";
import Footer from "../components/footer";
import PageWrapperProps from "../types/pageTypes";
import WhatsAppIcon from "../components/whatsAppIcon";
import styles from "../assets/css/layout.module.css"

const pageVariants: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: "0%", opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }
};

const PageWrapper: React.FC<PageWrapperProps> = ({ children, config }) => {
  return (
    <motion.div
      layoutId="page-wrapper"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      <Navbar
        navItems={config.navbar.navItems}
        navButtons={config.navbar.navButtons}
      />
      <Banner
        content={config.banner.content}
        imgSrc={config.banner.imgSrc}
        isReverse={config.banner.isReverse}
      />
      {children}
      <div className={styles.whatsappContainer}>
        <WhatsAppIcon/>
      </div>

      <Footer />
    </motion.div>
  );
};

export default PageWrapper;

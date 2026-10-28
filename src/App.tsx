import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import siteConfig from "./config/siteConfig";

const pageVariants: Variants = {
  initial: { opacity: 0, x: "100%" },
  animate: { opacity: 1, x: "0%", transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: "-100%", transition: { duration: 0.3, ease: "easeIn" } },
};

const App: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{ position: "relative", width: "100vw", height: "100%" }}>
      <AnimatePresence mode="sync">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {siteConfig.pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    background: "white",
                  }}
                >
                  <page.page />
                </motion.div>
              }
            />
          ))}
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;

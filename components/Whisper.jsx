import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styles from './Whisper.module.css';

/**
 * Whisper 组件 - 悬停显示提示卡片
 * 一个优雅的、带有动画效果的提示组件，用于在文本中插入解释性内容
 * 
 * @param {string} content - 要显示的提示内容
 * @param {string} emoji - 可选的触发图标，默认为 🌱
 */
export const Whisper = ({ content, emoji = '🌱' }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 定义动效：一个有"弹性"的浮现
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 20, stiffness: 300 }
    }
  };

  return (
    <motion.span 
      className={styles.whisperTrigger}
      onHoverStart={() => setIsVisible(true)}
      onHoverEnd={() => setIsVisible(false)}
      whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
      aria-label="悬停查看提示"
    >
      {emoji}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={styles.whisperCard}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.span>
  );
};


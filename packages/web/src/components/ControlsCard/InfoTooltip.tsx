// src/components/ControlsCard/InfoTooltip.tsx
import { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  MOBILE_BREAKPOINT,
  ANIMATION_DELAY,
} from './InfoTooltip.constants';
import styles from './InfoTooltip.module.css';

interface InfoTooltipProps {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  position?: 'sideLeft';
  size?: 'small';
}

export function InfoTooltip({ title, children, icon, position, size }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle open state changes from the Tooltip component
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  // Handle click for mobile/touch
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    }
  }, [isMobile]);

  // Handle hover for desktop
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsOpen(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) setIsOpen(false);
  }, [isMobile]);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-info-tooltip]')) {
        setIsOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, isMobile]);

  const isSmall = size === 'small';
  const isSideLeft = position === 'sideLeft';

  return (
    <Tooltip open={isOpen} onOpenChange={handleOpenChange} delayDuration={ANIMATION_DELAY}>
      <TooltipTrigger asChild>
        <span
          data-info-tooltip
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            styles.trigger,
            isOpen && styles.triggerOpen,
            isSmall ? styles.triggerSmall : styles.triggerDefault
          )}
        >
          <Info className={cn(isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5', 'stroke-[2.5]')} />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={isSideLeft ? 'left' : 'top'}
        align="center"
        sideOffset={12}
        className={cn(
          styles.content,
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2'
        )}
      >
        {/* Header with icon and title */}
        {(icon || title) && (
          <div className={styles.header}>
            {icon && <div className={styles.iconWrapper}>{icon}</div>}
            {title && <span className={styles.title}>{title}</span>}
          </div>
        )}

        {/* Body content */}
        <div className={styles.body}>{children}</div>
      </TooltipContent>
    </Tooltip>
  );
}

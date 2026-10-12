import React from "react";

export const FantasyPanel = ({ as: Element = "div", className = "", ...props }) => (
  <Element className={`fantasy-ui fantasy-panel ${className}`} {...props} />
);

export const FantasyHudCard = ({ className = "", ...props }) => (
  <FantasyPanel className={`fantasy-hud-card ${className}`} {...props} />
);

export const FantasyButton = ({ variant = "primary", className = "", type = "button", ...props }) => (
  <button type={type} className={`fantasy-ui btn fantasy-button fantasy-button-${variant} ${className}`} {...props} />
);

export const FantasySectionHeader = ({ as: Element = "h4", className = "", ...props }) => (
  <Element className={`fantasy-ui fantasy-section-header ${className}`} {...props} />
);

export const FantasyBadge = ({ tone = "neutral", className = "", ...props }) => (
  <span className={`fantasy-ui fantasy-badge fantasy-badge-${tone} ${className}`} {...props} />
);

export const FantasyDivider = ({ className = "", ...props }) => (
  <hr className={`fantasy-ui fantasy-divider ${className}`} {...props} />
);

export const FantasyKey = ({ className = "", ...props }) => (
  <kbd className={`fantasy-key ${className}`} {...props} />
);

export const FantasyMeter = ({ value, max, percentage, label, tone = "health", className = "" }) => (
  <div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}
    className={`fantasy-meter fantasy-meter-${tone} ${className}`}>
    <div className="fantasy-meter-fill" style={{ width: `${percentage}%` }} />
  </div>
);

export const FantasyNotice = ({ tone = "neutral", className = "", ...props }) => (
  <FantasyHudCard className={`fantasy-notice fantasy-notice-${tone} ${className}`} {...props} />
);

export const FantasyNotificationStack = ({ children }) => (
  <div className="fantasy-notification-stack pointer-events-none">{children}</div>
);

// Presentation only: callers keep their own open state, focus, dismissal and dragging.
export const FantasyModalFrame = ({ title, children, onClose, closeDisabled = false,
  className = "", headerClassName = "", bodyClassName = "", closeClassName = "",
  headerProps, ...props }) => (
  <FantasyPanel className={`fantasy-modal-frame ${className}`} {...props}>
    <div className={`fantasy-modal-header ${headerClassName}`} {...headerProps}>
      <h3 className="text-xl font-bold">{title}</h3>
      <FantasyButton variant="ghost" className={`fantasy-modal-close btn-sm btn-circle ${closeClassName}`}
        aria-label={`Close ${title}`} disabled={closeDisabled} onClick={onClose}>✕</FantasyButton>
    </div>
    <div className={`fantasy-modal-body ${bodyClassName}`}>{children}</div>
  </FantasyPanel>
);

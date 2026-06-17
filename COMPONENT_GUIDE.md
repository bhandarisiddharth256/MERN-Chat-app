# Design System & Component API Documentation

## Design System (`src/utils/designSystem.js`)

### Available Exports

#### Color Tokens
```javascript
import { COLORS } from '../utils/designSystem';

COLORS.primary[500]        // #0ea5e9
COLORS.bg.primary          // #0f172a
COLORS.text.primary        // #f1f5f9
COLORS.accent.online       // #10b981
COLORS.status.error        // #ef4444
```

#### Spacing
```javascript
import { SPACING } from '../utils/designSystem';

SPACING.xs   // 0.25rem (4px)
SPACING.sm   // 0.5rem (8px)
SPACING.md   // 1rem (16px)
SPACING.lg   // 1.5rem (24px)
SPACING.xl   // 2rem (32px)
```

#### Border Radius
```javascript
import { BORDER_RADIUS } from '../utils/designSystem';

BORDER_RADIUS.sm      // 0.375rem (6px)
BORDER_RADIUS.md      // 0.5rem (8px)
BORDER_RADIUS.lg      // 0.75rem (12px)
BORDER_RADIUS.full    // 9999px
```

#### Animations
```javascript
import { ANIMATION } from '../utils/designSystem';

// Usage in Framer Motion components
<motion.div {...ANIMATION.slideIn}>Slide in from left</motion.div>
<motion.div {...ANIMATION.fadeIn}>Fade in</motion.div>
<motion.div {...ANIMATION.scaleIn}>Scale up</motion.div>
<motion.div {...ANIMATION.slideUp}>Slide up</motion.div>
```

#### Utility Functions
```javascript
import { 
  formatTime,
  formatFullTime,
  truncateText,
  getInitials,
  shouldGroupMessages 
} from '../utils/designSystem';

// Format timestamp
formatTime(new Date())  // "now", "5m", "12:30 PM", "May 29"

// Format full time
formatFullTime(new Date())  // "12:30 PM"

// Truncate with ellipsis
truncateText("Long message", 20)  // "Long message..."

// Get initials for avatar
getInitials("John Doe")  // "JD"

// Check if messages should be grouped
shouldGroupMessages(currentMsg, previousMsg)  // true/false
```

---

## UI Components (`src/components/ui/index.jsx`)

### Avatar Component
```jsx
import { Avatar } from './ui';

// Basic usage
<Avatar name="John Doe" size="md" />

// With online indicator
<Avatar name="John Doe" size="md" isOnline={true} />

// Sizes: sm, md, lg, xl
<Avatar name="Jane" size="lg" />
```

### Badge Component
```jsx
import { Badge } from './ui';

// Show unread count
<Badge count={5} variant="primary" size="md" />

// Variants: primary, success, error, warning, muted
<Badge count={3} variant="success" />

// With animation (pulsing)
<Badge count={1} animated={true} />
```

### Spinner Component
```jsx
import { Spinner } from './ui';

// Loading indicator
<Spinner size="md" variant="primary" />

// Sizes: sm, md, lg
// Variants: primary, white, gray
<Spinner size="lg" variant="white" />
```

### TypingIndicator Component
```jsx
import { TypingIndicator } from './ui';

// Shows three bouncing dots
{typingUser && (
  <div className="flex items-center gap-2">
    <TypingIndicator />
    <span>{typingUser} is typing...</span>
  </div>
)}
```

### OnlineIndicator Component
```jsx
import { OnlineIndicator } from './ui';

// Shows pulsing green dot for online
<OnlineIndicator isOnline={true} size="sm" />

// Gray dot for offline
<OnlineIndicator isOnline={false} size="md" />
```

### MessageBubble Component
```jsx
import { MessageBubble } from './ui';

// Render a single message
<MessageBubble
  message={messageObj}
  isOwn={message.sender._id === currentUser._id}
  showAvatar={true}
  showTime={true}
  isHighlighted={false}
  onClick={handleMessageClick}
/>
```

### EmptyState Component
```jsx
import { EmptyState } from './ui';
import { MessageCircle } from 'lucide-react';

// Show when no results
<EmptyState
  icon={MessageCircle}
  title="No conversations yet"
  description="Start by searching for users"
/>
```

---

## Using Design Tokens in Components

### Example: Custom Button
```jsx
import { motion } from 'framer-motion';
import { COLORS, TRANSITIONS, ANIMATION } from '../utils/designSystem';

export const CustomButton = ({ children, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg
        bg-blue-600 hover:bg-blue-700
        text-white font-medium
        transition
      `}
      style={{ transitionDuration: TRANSITIONS.normal }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...ANIMATION.slideIn}
    >
      {children}
    </motion.button>
  );
};
```

### Example: Custom Card
```jsx
import { motion } from 'framer-motion';
import { ANIMATION, SHADOWS } from '../utils/designSystem';

export const CustomCard = ({ children, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className="bg-slate-800 rounded-lg p-4 cursor-pointer border border-slate-700/50"
      style={{ boxShadow: SHADOWS.md }}
      whileHover={{ y: -2, boxShadow: SHADOWS.lg }}
      {...ANIMATION.fadeIn}
    >
      {children}
    </motion.div>
  );
};
```

---

## Animation Patterns

### Modal Animation
```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION } from '../utils/designSystem';

<AnimatePresence>
  {showModal && (
    <motion.div
      className="fixed inset-0 bg-black/60"
      {...ANIMATION.fadeIn}
    >
      <motion.div
        className="bg-slate-800 rounded-xl p-6"
        {...ANIMATION.scaleIn}
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### List Animation (Staggered)
```jsx
{messages.map((msg, index) => (
  <motion.div
    key={msg._id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    {/* Message content */}
  </motion.div>
))}
```

### Hover Animations
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 rounded-lg"
>
  Click me
</motion.button>
```

---

## Color Usage Guidelines

### Primary Actions
Use `COLORS.primary[600]` for main CTAs:
```jsx
<button className="bg-blue-600 hover:bg-blue-700">
  Save
</button>
```

### Text Hierarchy
```jsx
// Primary text (headers, important)
<p className="text-gray-100">{primaryText}</p>

// Secondary text (descriptions)
<p className="text-gray-400">{secondaryText}</p>

// Muted text (helper, hints)
<p className="text-gray-500">{mutedText}</p>

// Faint text (very subtle)
<p className="text-gray-600">{faintText}</p>
```

### Status Colors
```jsx
// Online
<div className="text-green-500">Online</div>

// Offline
<div className="text-gray-500">Offline</div>

// Error
<div className="text-red-500">Error</div>

// Warning
<div className="text-amber-500">Warning</div>
```

---

## Creating New Components

### Template
```jsx
import { motion } from 'framer-motion';
import { ANIMATION, COLORS, TRANSITIONS } from '../utils/designSystem';

/**
 * MyComponent - Brief description
 * @param {object} props - Component props
 * @param {string} props.title - Title text
 * @param {function} props.onClick - Click handler
 */
export const MyComponent = ({ title, onClick }) => {
  return (
    <motion.div
      className="bg-slate-800 rounded-lg p-4 cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -2 }}
      {...ANIMATION.slideIn}
    >
      <h3 className="text-gray-100 font-semibold">{title}</h3>
    </motion.div>
  );
};
```

---

## Tailwind Classes Reference

### Background Colors
- `bg-slate-900` - Primary background
- `bg-slate-800` - Secondary background  
- `bg-blue-600` - Primary action

### Text Colors
- `text-gray-100` - Primary text
- `text-gray-400` - Secondary text
- `text-gray-500` - Muted text

### Borders
- `border border-slate-700/50` - Subtle border
- `border-slate-800/50` - Very subtle border

### Rounded
- `rounded-lg` - 8px radius
- `rounded-xl` - 12px radius
- `rounded-full` - Circular

### Shadows
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow

---

## Performance Tips

1. **Use Transform Only for Animations**
   ```jsx
   // Good - GPU accelerated
   whileHover={{ scale: 1.05 }}
   
   // Avoid - CPU intensive
   whileHover={{ width: 200 }}
   ```

2. **Memoize Heavy Components**
   ```jsx
   export const MessageList = React.memo(({ messages }) => {
     return messages.map(msg => <Message key={msg._id} msg={msg} />);
   });
   ```

3. **Use AnimatePresence for Unmounting**
   ```jsx
   <AnimatePresence>
     {isVisible && <Component {...ANIMATION.fadeIn} />}
   </AnimatePresence>
   ```

---

## Testing Components

### With React Testing Library
```jsx
import { render, screen } from '@testing-library/react';
import { Avatar } from './ui';

test('renders avatar with name', () => {
  render(<Avatar name="John" size="md" />);
  expect(screen.getByText('JD')).toBeInTheDocument();
});
```

---

## Troubleshooting

### Component not animating?
- Check Framer Motion is installed
- Verify AnimatePresence wraps conditional components
- Ensure animation object syntax is correct

### Styles not applying?
- Check Tailwind CSS is configured
- Verify class names are correct
- Clear browser cache

### Performance issues?
- Check animations use transform/opacity only
- Verify no unnecessary re-renders
- Use React.memo for list items

---

**Last Updated**: May 29, 2026
**Version**: 1.0

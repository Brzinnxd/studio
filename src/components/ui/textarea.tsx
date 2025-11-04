import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, style, ...props}, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const fitToContent = () => {
       if (internalRef.current) {
        internalRef.current.style.height = 'auto'; // Reset height
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`; // Set to scroll height
      }
    }

    React.useEffect(() => {
      fitToContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, props.defaultValue]);

    React.useEffect(() => {
      window.addEventListener('resize', fitToContent);
      return () => window.removeEventListener('resize', fitToContent);
    }, []);

    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden',
          className
        )}
        ref={internalRef}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};

    
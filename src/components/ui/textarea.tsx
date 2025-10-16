import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, style, ...props}, ref) => {
    const [value, setValue] = React.useState(props.value || props.defaultValue || '');
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
      if (props.onChange) {
        props.onChange(event);
      }
    };

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [value]);

    React.useEffect(() => {
      const currentValue = props.value || props.defaultValue || '';
      if (value !== currentValue) {
        setValue(currentValue);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, props.defaultValue]);


    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={internalRef}
        style={{ ...style, overflowY: 'hidden' }}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};

import React, { useRef } from 'react';
import SpeakButton from '@/components/common/SpeakButton';
import { collectReadableText } from '@/lib/readText';

/**
 * Wraps any block of content so every line inside it can be read out loud.
 * `controls` also reads the labels of buttons, chips and filters inside it.
 */
export default function Speakable({ as: Tag = 'div', className = '', controls = false, listenClassName = '', children, ...rest }) {
  const ref = useRef(null);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
      <SpeakButton
        text={() => collectReadableText(ref.current, { includeControls: controls })}
        className={`mt-3 ${listenClassName}`.trim()}
      />
    </Tag>
  );
}
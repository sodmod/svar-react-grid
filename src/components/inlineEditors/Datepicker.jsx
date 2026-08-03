import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Dropdown } from '@svar-ui/react-core';
import './Datepicker.css';

export default function Datepicker({ editor, onAction, onSave, onApply, onCancel }) {
  const [value] = useState(() => editor.value || new Date());
  const { template, cell, dropdown = {} } = editor?.config || {};
  const dropdownOptions = useMemo(() => ({
    trackScroll: true,
    width: 'auto',
    ...dropdown,
  }), [dropdown]);

  function updateValue({ value }) {
    onApply(value);
    onSave();
  }

  const nodeRef = useRef(null);

  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.focus();
    }
    if (typeof window !== 'undefined' && window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }, []);

  return (
    <>
      <div
        className="wx-lNWNYUb6 wx-value"
        ref={nodeRef}
        tabIndex={0}
        onClick={onCancel}
        onKeyDown={(ev) => ev.preventDefault()}
      >
        {template ? (
          template(value)
        ) : cell ? (
          (() => {
            const Component = cell;
            return <Component data={editor.value} onAction={onAction} />;
          })()
        ) : (
          <span className="wx-lNWNYUb6 wx-text">{editor.renderedValue}</span>
        )}
      </div>
      <Dropdown {...dropdownOptions} onCancel={() => onCancel(true)}>
        <Calendar
          value={value}
          onChange={updateValue}
          buttons={editor.config?.buttons}
        />
      </Dropdown>
    </>
  );
}

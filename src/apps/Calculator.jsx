import React, { useState } from 'react';
import '../styles/apps.css';

/**
 * Calculator App
 */

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(true);

  // Handle number input
  const handleNumber = (num) => {
    if (newNumber) {
      setDisplay(String(num));
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  // Handle decimal
  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle operation
  const handleOperation = (op) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setNewNumber(true);
  };

  // Calculate result
  const calculate = (prev, current, op) => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current === 0 ? 0 : prev / current;
      default:
        return current;
    }
  };

  // Handle equals
  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  // Clear
  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  // Toggle sign
  const handleToggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  // Percentage
  const handlePercentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  // Keyboard support disabled - use buttons for best UX
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     // Keyboard events handled via button clicks
  //   };
  //   document.addEventListener('keydown', handleKeyDown);
  //   return () => document.removeEventListener('keydown', handleKeyDown);
  // }, []);

  return (
    <div className="calculator">
      {/* Display */}
      <div className="calc-display">{display}</div>

      {/* Buttons grid */}
      <div className="calc-buttons">
        <button onClick={handleClear} className="btn-function">
          C
        </button>
        <button onClick={handleToggleSign} className="btn-function">
          +/-
        </button>
        <button onClick={handlePercentage} className="btn-function">
          %
        </button>
        <button onClick={() => handleOperation('/')} className="btn-operator">
          ÷
        </button>

        <button onClick={() => handleNumber(7)} className="btn-number">
          7
        </button>
        <button onClick={() => handleNumber(8)} className="btn-number">
          8
        </button>
        <button onClick={() => handleNumber(9)} className="btn-number">
          9
        </button>
        <button onClick={() => handleOperation('*')} className="btn-operator">
          ×
        </button>

        <button onClick={() => handleNumber(4)} className="btn-number">
          4
        </button>
        <button onClick={() => handleNumber(5)} className="btn-number">
          5
        </button>
        <button onClick={() => handleNumber(6)} className="btn-number">
          6
        </button>
        <button onClick={() => handleOperation('-')} className="btn-operator">
          −
        </button>

        <button onClick={() => handleNumber(1)} className="btn-number">
          1
        </button>
        <button onClick={() => handleNumber(2)} className="btn-number">
          2
        </button>
        <button onClick={() => handleNumber(3)} className="btn-number">
          3
        </button>
        <button onClick={() => handleOperation('+')} className="btn-operator">
          +
        </button>

        <button onClick={() => handleNumber(0)} className="btn-number btn-zero">
          0
        </button>
        <button onClick={handleDecimal} className="btn-number">
          .
        </button>
        <button onClick={handleEquals} className="btn-equals">
          =
        </button>
      </div>
    </div>
  );
};

export default Calculator;

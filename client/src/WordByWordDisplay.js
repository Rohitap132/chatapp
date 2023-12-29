// WordByWordDisplay.js

import React, { useState, useEffect } from 'react';

const WordByWordDisplay = ({ sentence, delay }) => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    const timeoutIds = [];
    setWords([]);

    sentence.split(' ').forEach((word, index) => {
      const timeoutId = setTimeout(() => {
        setWords((prevWords) => [...prevWords, word]);
      }, index * delay);

      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [sentence, delay]);

  return (
    <div className="word-by-word-display">
      <div className="line">{words.slice(0, Math.ceil(words.length / 2)).join(' ')}</div>
      <div className="line">{words.slice(Math.ceil(words.length / 2)).join(' ')}</div>
    </div>
  );
};

export default WordByWordDisplay;

import React from 'react';

const SimpleTest: React.FC = () => {
  console.log('SimpleTest: Component rendering');
  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1>Simple Test Component</h1>
      <p>If you can see this, the routing is working.</p>
    </div>
  );
};

export default SimpleTest;
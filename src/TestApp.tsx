const TestApp = () => {
  console.log('TestApp rendering');
  
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'red',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        zIndex: 9999
      }}
    >
      RED SCREEN TEST - If you see this, React is working!
    </div>
  );
};

export default TestApp;

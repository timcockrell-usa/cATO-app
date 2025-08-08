import { jsx as _jsx } from "react/jsx-runtime";
const TestApp = () => {
    console.log('TestApp rendering');
    return (_jsx("div", { style: {
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
        }, children: "RED SCREEN TEST - If you see this, React is working!" }));
};
export default TestApp;

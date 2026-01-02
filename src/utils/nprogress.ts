// import NProgress from 'nprogress';
// import 'nprogress/nprogress.css';

// Mock implementation due to install failure
const NProgress = {
    start: () => { console.log('NProgress start'); },
    done: () => { console.log('NProgress done'); },
    configure: (options: any) => { }
};

export default NProgress;

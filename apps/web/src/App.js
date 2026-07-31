import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/index';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
        },
    },
});
export default function App() {
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }), import.meta.env.DEV && _jsx(ReactQueryDevtools, { initialIsOpen: false })] }));
}
//# sourceMappingURL=App.js.map
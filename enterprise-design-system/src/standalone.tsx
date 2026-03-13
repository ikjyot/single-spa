import { createRoot } from 'react-dom/client';

// Import our enterprise CSS and our Shadcn Button!
import './index.css';
import { Button } from './components/ui/button';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <div className="ds:flex ds:flex-col ds:gap-6 ds:items-start">
            <h1 className="ds:text-2xl ds:font-bold">Enterprise UI Sandbox</h1>

            <div className="ds:flex ds:gap-4">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="destructive">Destructive Action</Button>
            </div>
        </div>
    );
}
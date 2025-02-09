import { GraphPaperProvider } from '../contexts/GraphPaperContext';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GraphPaperProvider>
          {children}
        </GraphPaperProvider>
      </body>
    </html>
  );
}
export interface AppProps {
  title?: string;
}

export function App({ title = 'resort-website-a-fe' }: AppProps) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  );
}

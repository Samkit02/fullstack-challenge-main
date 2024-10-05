
import SearchResults from './search/results';

export default function Home() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">YC Company and Job Search</h1>
      <SearchResults />
    </main>
  );
}
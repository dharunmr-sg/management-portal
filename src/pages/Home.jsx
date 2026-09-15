import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Home() {
  const handleButtonClick = () => {
    alert("Button clicked!");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome to GuideXR Admin
          </h1>
          <Badge variant="brand">New</Badge>
        </div>
        <p className="mt-4 mb-6 text-gray-600 dark:text-gray-400">
          This is our first page component! We are wrapping this content inside a reusable Card.
        </p>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
          <Spinner />
        </div>
        
        <div className="flex flex-col gap-4 max-w-sm mb-8">
          <Input placeholder="Type something here..." />
          <Button onClick={handleButtonClick}>
            Get Started
          </Button>
        </div>

        <EmptyState 
          title="No users found" 
          description="We couldn't find any users matching your search."
        >
          <Button onClick={() => alert("Creating user...")}>
            Add New User
          </Button>
        </EmptyState>
      </Card>
    </div>
  );
}

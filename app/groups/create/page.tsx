import { WalletConnect } from '@/components/auth/WalletConnect';
import { CreateGroupForm } from '@/components/groups/CreateGroupForm';

export default function CreateGroupPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Create New Savings Group</h1>
          <WalletConnect />
        </div>
        
        <CreateGroupForm />
      </div>
    </main>
  );
} 
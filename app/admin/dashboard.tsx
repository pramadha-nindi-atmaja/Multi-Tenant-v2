'use client';

import React, { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Loader2, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { deleteSubdomainAction, updateSubdomainAction } from '@/app/actions';
import { rootDomain, protocol } from '@/lib/utils';

type Tenant = {
  subdomain: string;
  emoji: string;
  createdAt: number;
};

type DeleteState = {
  error?: string;
  success?: string;
};

type UpdateState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function DashboardHeader() {
  // TODO: You can add authentication here with your preferred auth provider

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Subdomain Management</h1>
      <div className="flex items-center gap-4">
        {rootDomain && (
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {rootDomain}
          </Link>
        )}
      </div>
    </div>
  );
}

function TenantGrid({
  tenants,
  deleteAction,
  isDeletePending
}: {
  tenants: Tenant[];
  deleteAction: (formData: FormData) => void;
  isDeletePending: boolean;
}) {
  const [editingTenant, setEditingTenant] = useState<string | null>(null);
  const [editEmoji, setEditEmoji] = useState('');
  
  // State for handling subdomain updates
  const [updateState, updateAction, isUpdatePending] = useActionState<UpdateState, FormData>(
    updateSubdomainAction,
    {}
  );

  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant.subdomain);
    setEditEmoji(tenant.emoji);
  };

  const handleSaveEdit = (subdomain: string) => {
    const formData = new FormData();
    formData.append('subdomain', subdomain);
    formData.append('icon', editEmoji);
    updateAction(formData);
    setEditingTenant(null);
  };

  if (tenants.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No subdomains have been created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <Card key={tenant.subdomain}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{tenant.subdomain}</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(tenant)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="h-5 w-5" />
                </Button>
                <form action={deleteAction}>
                  <input
                    type="hidden"
                    name="subdomain"
                    value={tenant.subdomain}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={isDeletePending}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    {isDeletePending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingTenant === tenant.subdomain ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    className="flex-1 border border-input rounded-md px-3 py-2 text-lg"
                    placeholder="Enter emoji"
                  />
                  <Button 
                    onClick={() => handleSaveEdit(tenant.subdomain)}
                    disabled={isUpdatePending}
                    size="sm"
                  >
                    {isUpdatePending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingTenant(null)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
                {updateState.error && (
                  <p className="text-sm text-red-500">{updateState.error}</p>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{tenant.emoji}</div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(tenant.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={`http://${tenant.subdomain}.${rootDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Visit subdomain →
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboard({ tenants }: { tenants: Tenant[] }) {
  const [deleteState, deleteAction, isDeletePending] = useActionState<DeleteState, FormData>(
    deleteSubdomainAction,
    {}
  );

  return (
    <div className="space-y-6 relative p-4 md:p-8">
      <DashboardHeader />
      <TenantGrid 
        tenants={tenants} 
        deleteAction={deleteAction} 
        isDeletePending={isDeletePending} 
      />

      {deleteState.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          {deleteState.error}
        </div>
      )}

      {deleteState.success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md">
          {deleteState.success}
        </div>
      )}
    </div>
  );
}

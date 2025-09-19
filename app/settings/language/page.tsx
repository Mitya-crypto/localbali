'use client';
import React from 'react';
import Container from '../../../components/ui/Container';
import { Card, CardBody } from '../../../components/ui/Card';

export default function LanguagePage() {
  return (
    <main className="py-4">
      <Container>
        <h1 className="text-2xl font-semibold mb-4">Язык</h1>
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <div className="font-medium">Русский</div>
              <div className="text-sm text-gray-500">Текущий язык приложения</div>
            </div>
            <div className="w-6 h-6 rounded-full border bg-black border-black text-white">
              <span className="block text-center leading-6">✓</span>
            </div>
          </CardBody>
        </Card>
        <p className="text-xs text-gray-500 mt-3">Другие языки отключены.</p>
      </Container>
    </main>
  );
}

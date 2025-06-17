'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './main-layout';
import { SidebarNavItem, TocItem } from '@/types';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  sidebarItems?: SidebarNavItem[];
  tocItems?: TocItem[];
  className?: string;
}

export function ConditionalLayout({ 
  children, 
  sidebarItems = [], 
  tocItems = [],
  className 
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Editor 경로에서는 기본 레이아웃만 적용 (이중 레이아웃 방지)
  if (pathname?.startsWith('/editor')) {
    return <>{children}</>;
  }
  
  // 다른 모든 경로에서는 MainLayout 적용
  return (
    <MainLayout 
      sidebarItems={sidebarItems}
      tocItems={tocItems}
      className={className}
    >
      {children}
    </MainLayout>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookMarked,
  CandlestickChart,
  LayoutDashboard,
  LineChart,
  Package,
  ShoppingBag,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { Logo } from '@/components/logo';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/sidebar';
import { Separator } from './ui/separator';
import { useCart } from '@/context/cart-context';
import { useState } from 'react';

export function MainNav() {
  const pathname = usePathname();
  const { cartItemCount } = useCart();
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(
    pathname.includes('/dashboard/cash-flow')
  );

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path.endsWith('/dashboard/cash-flow'))
      return pathname === '/dashboard/cash-flow';
    return pathname.startsWith(path);
  };

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/')}
              tooltip="Catálogo"
            >
              <Link href="/">
                <BookMarked />
                <span>Catálogo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/cart')}
              tooltip="Carrinho"
            >
              <Link href="/cart">
                <ShoppingCart />
                <span>Carrinho</span>
                {cartItemCount > 0 && (
                  <SidebarMenuBadge>{cartItemCount}</SidebarMenuBadge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard') && pathname.split('/').length === 2}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard/orders')}
                tooltip="Pedidos"
              >
                <Link href="/dashboard/orders">
                  <ShoppingBag />
                  <span>Pedidos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard/inventory')}
                tooltip="Estoque"
              >
                <Link href="/dashboard/inventory">
                  <Package />
                  <span>Estoque</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard/customers')}
                tooltip="Clientes"
              >
                <Link href="/dashboard/customers">
                  <Users />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard/trends')}
                tooltip="Tendências"
              >
                <Link href="/dashboard/trends">
                  <LineChart />
                  <span>Tendências</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Collapsible open={isCashFlowOpen} onOpenChange={setIsCashFlowOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    variant="ghost"
                    className="w-full justify-start"
                    isActive={isActive('/dashboard/cash-flow')}
                    tooltip="Fluxo de Caixa"
                  >
                    <CandlestickChart />
                    <span>Fluxo de Caixa</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 space-y-1">
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    variant="ghost"
                    isActive={isActive('/dashboard/cash-flow')}
                  >
                    <Link href="/dashboard/cash-flow">Empresarial</Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    variant="ghost"
                    isActive={isActive('/dashboard/personal-cash-flow')}
                  >
                    <Link href="/dashboard/personal-cash-flow">
                      Pessoal
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

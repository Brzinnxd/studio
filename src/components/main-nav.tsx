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
  ChevronDown,
  Briefcase,
  User,
  Combine,
  PlusCircle,
  ArrowRightLeft,
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
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function MainNav() {
  const pathname = usePathname();
  const { cartItemCount } = useCart();
  const { userProfile } = useAuth();
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(
    pathname.includes('/dashboard/cash-flow') || pathname.includes('/dashboard/personal-cash-flow') || pathname.includes('/dashboard/general-cash-flow') || pathname.includes('/dashboard/transfers')
  );

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };
  
  const isCashFlowActive = isActive('/dashboard/cash-flow') || isActive('/dashboard/personal-cash-flow') || isActive('/dashboard/general-cash-flow') || isActive('/dashboard/transfers');

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
              isActive={isActive('/', true)}
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
        
        {userProfile?.isAdmin && (
            <>
                <Separator className="my-2" />
                <SidebarGroup>
                <SidebarGroupLabel>Administração</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/dashboard', true)}
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
                        isActive={isActive('/dashboard/add-product')}
                        tooltip="Adicionar Produto"
                    >
                        <Link href="/dashboard/add-product">
                        <PlusCircle />
                        <span>Adicionar Produto</span>
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
                            className="w-full justify-between"
                            isActive={isCashFlowActive}
                            tooltip="Fluxo de Caixa"
                        >
                            <div className="flex items-center gap-2">
                            <CandlestickChart />
                            <span>Fluxo de Caixa</span>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isCashFlowOpen && "rotate-180")} />
                        </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 pt-1 space-y-1 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                        <SidebarMenuButton
                            asChild
                            size="sm"
                            variant="ghost"
                            isActive={isActive('/dashboard/cash-flow')}
                            className="w-full"
                        >
                            <Link href="/dashboard/cash-flow">
                                <Briefcase className="h-4 w-4" />
                                <span>Empresarial</span>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            asChild
                            size="sm"
                            variant="ghost"
                            isActive={isActive('/dashboard/personal-cash-flow')}
                            className="w-full"
                        >
                            <Link href="/dashboard/personal-cash-flow">
                            <User className="h-4 w-4" />
                            <span>Pessoal</span>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            asChild
                            size="sm"
                            variant="ghost"
                            isActive={isActive('/dashboard/general-cash-flow')}
                            className="w-full"
                        >
                            <Link href="/dashboard/general-cash-flow">
                            <Combine className="h-4 w-4" />
                            <span>Geral</span>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            asChild
                            size="sm"
                            variant="ghost"
                            isActive={isActive('/dashboard/transfers')}
                            className="w-full"
                        >
                            <Link href="/dashboard/transfers">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span>Transferências</span>
                            </Link>
                        </SidebarMenuButton>
                        </CollapsibleContent>
                    </Collapsible>
                    </SidebarMenuItem>
                </SidebarMenu>
                </SidebarGroup>
            </>
        )}
      </SidebarContent>
    </>
  );
}

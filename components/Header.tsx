import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, SearchIcon, BellIcon } from './icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { User } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  currentUser: User;
  setActivePage: (page: string) => void;
  pageConfig: { title: string; subtitle: string };
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, currentUser, setActivePage, pageConfig, unreadCount }) => {

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden bg-white/70"
          onClick={onMenuClick}
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-slate-800">{pageConfig.title}</h1>
          <p className="text-sm text-slate-500">{pageConfig.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
        <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => setActivePage('Notifications')}>
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-slate-50">{unreadCount}</span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <div className="relative">
          <div
            className="flex items-center gap-2 p-1 rounded-full text-slate-900 select-none"
          >
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt="User avatar"
                className="aspect-square h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold flex-shrink-0">
                {getInitials(currentUser.name)}
              </div>
            )}
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
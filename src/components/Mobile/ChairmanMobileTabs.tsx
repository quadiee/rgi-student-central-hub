
import React from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../ui/sheet';
import { Menu, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  count?: number;
}

interface ChairmanMobileTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title?: string;
}

const ChairmanMobileTabs: React.FC<ChairmanMobileTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  title = "Select Section"
}) => {
  const [showTabMenu, setShowTabMenu] = React.useState(false);
  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setShowTabMenu(false);
  };

  return (
    <div className="sticky top-[120px] z-20 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {currentTab && (
            <>
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <currentTab.icon className={`w-4 h-4 mr-2 ${currentTab.color}`} />
                {currentTab.label}
                {currentTab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {currentTab.count}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {currentTab.description}
              </p>
            </>
          )}
        </div>
        
        <Sheet open={showTabMenu} onOpenChange={setShowTabMenu}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="ml-3">
              <Menu className="w-4 h-4 mr-2" />
              Sections
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh] pb-safe">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-center">{title}</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "h-auto flex flex-col items-start justify-start gap-2 p-4 text-left transition-all duration-200",
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Icon className={cn(
                          "w-5 h-5",
                          isActive ? 'text-white' : tab.color
                        )} />
                        <span className={cn(
                          "font-medium",
                          isActive ? 'text-white' : 'text-gray-700'
                        )}>
                          {tab.label}
                        </span>
                      </div>
                      {tab.count !== undefined && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs w-full",
                      isActive ? 'text-purple-100' : 'text-gray-500'
                    )}>
                      {tab.description}
                    </p>
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ChairmanMobileTabs;

import type { ComponentType, ReactNode, SVGProps } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  action?: ReactNode;
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {Icon && (
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

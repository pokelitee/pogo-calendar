import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card, INTERACTIVE_CARD_CLASSNAME } from '../components/ui/card';
import { TOOLS } from '../config/tools';

function ToolsPage() {
  return (
    <div>
      <PageHeader title="Tools" description="Helpers for planning and managing your Pokémon in game." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <RouterLink key={tool.path} to={tool.path} className="text-inherit no-underline">
              <Card className={`flex h-full flex-col gap-3 p-5 ${INTERACTIVE_CARD_CLASSNAME}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="mb-1 text-lg font-semibold">{tool.label}</h2>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </Card>
            </RouterLink>
          );
        })}
      </div>
    </div>
  );
}

export default ToolsPage;

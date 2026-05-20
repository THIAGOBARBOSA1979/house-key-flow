import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SystemSettings } from "@/services";

interface NotificationsTabProps {
  settings: SystemSettings;
  setSettings: (updater: (prev: SystemSettings) => SystemSettings) => void;
}

export const NotificationsTab = ({ settings, setSettings }: NotificationsTabProps) => (
  <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <CardTitle>Canais de Comunicação</CardTitle>
      <CardDescription>Configure como e por onde os usuários recebem alertas do sistema.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h3 className="text-label font-black text-primary uppercase tracking-widest border-b pb-2">Para Clientes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold">E-mail</Label>
              <Switch 
                checked={settings?.notifications?.client?.email || false} 
                onCheckedChange={v => setSettings(p => ({
                  ...p, notifications: { ...p.notifications, client: { ...p.notifications.client, email: v }}
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-bold">WhatsApp / SMS</Label>
              <Switch 
                checked={settings?.notifications?.client?.sms || false} 
                onCheckedChange={v => setSettings(p => ({
                  ...p, notifications: { ...p.notifications, client: { ...p.notifications.client, sms: v }}
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-bold">Push Notifications</Label>
              <Switch 
                checked={settings?.notifications?.client?.push || false} 
                onCheckedChange={v => setSettings(p => ({
                  ...p, notifications: { ...p.notifications, client: { ...p.notifications.client, push: v }}
                }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-label font-black text-primary uppercase tracking-widest border-b pb-2">Para Equipe Técnica</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold">E-mail Interno</Label>
              <Switch 
                checked={settings?.notifications?.team?.email || false} 
                onCheckedChange={v => setSettings(p => ({
                  ...p, notifications: { ...p.notifications, team: { ...p.notifications.team, email: v }}
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-bold">Sistema (Dashboard)</Label>
              <Switch 
                checked={settings?.notifications?.team?.system || false} 
                onCheckedChange={v => setSettings(p => ({
                  ...p, notifications: { ...p.notifications, team: { ...p.notifications.team, system: v }}
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

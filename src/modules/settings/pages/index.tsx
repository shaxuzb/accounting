import { useNavigate } from "react-router";
import {
  Building2,
  Users,
  Lock,
  Bell,
  Globe,
  CreditCard,
  ChevronRight,
} from "lucide-react";


type Item = {
  key: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
};

function SettingsCard({
  item,
  onClick,
}: {
  item: Item;
  onClick: (to: string) => void;
}) {
  const Icon = item.icon;
  return (
    <div
      onClick={() => onClick(item.path)}
      className="flex items-center justify-between p-5 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer "
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm font-semibold">{item.title}</div>
          {item.description && (
            <div className="text-xs text-gray-500">{item.description}</div>
          )}
        </div>
      </div>
      <div className="text-gray-300">
        <ChevronRight />
      </div>
    </div>
  );
}

export default function SettingsListPage() {
  const navigate = useNavigate();

  const items: Item[] = [
    {
      key: "organization",
      title: "Tashkilot ma'lumotlari",
      description: "Kompaniya rekvizitlari va sozlamalar",
      path: "organization",
      icon: Building2,
    },
    {
      key: "users",
      title: "Foydalanuvchilar",
      description: "Xodimlar va ularning ruxsatlari",
      path: "users",
      icon: Users,
    },
    {
      key: "roles",
      title: "Rollar va ruxsatlar",
      description: "Foydalanuvchi rollarini boshqarish",
      path: "roles",
      icon: Lock,
    },
    {
      key: "notifications",
      title: "Bildirishnomalar",
      description: "Email va tizim xabarlari",
      path: "notifications",
      icon: Bell,
    },
    {
      key: "locale",
      title: "Til va mintaqa",
      description: "Interfeys tili va valyuta",
      path: "locale",
      icon: Globe,
    },
    {
      key: "billing",
      title: "Obuna va to'lov",
      description: "Tarif rejasi va to'lov tarixi",
      path: "billing",
      icon: CreditCard,
    },
  ];

  const handleClick = (path: string) => {
    navigate(`/main/settings/${path}`);
  };

  return (
    <div className="p-2">
    <h1 className="pt-5 font-bold text-4xl">Sozlamalar</h1>
    <p  className="pt-1 text-gray-500">Tizim parametrlari</p>
    <div >
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <SettingsCard key={item.key} item={item} onClick={handleClick} />
        ))}
      </div>
    </div>
   </div>
  );
}

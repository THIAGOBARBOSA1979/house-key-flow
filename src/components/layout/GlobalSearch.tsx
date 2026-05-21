
import { useMemo, useState, useEffect } from "react";
import { Search, Building, Users, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { propertyService, userService, documentService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks";
import { useNavigate } from "react-router-dom";

export function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [searchResults, setSearchResults] = useState<{ properties: any[], users: any[], documents: any[] }>({ properties: [], users: [], documents: [] });

  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      setSearchResults({ properties: [], users: [], documents: [] });
      return;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    const fetchResults = async () => {
      const properties = propertyService.getAllSync(user?.company_id, user?.is_super_admin).filter(p => p.name.toLowerCase().includes(query)).slice(0, 3);
      const users = userService.getAllSync(user?.company_id, user?.is_super_admin).filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)).slice(0, 3);
      const documents = await documentService.searchDocuments(debouncedSearchQuery, { companyId: user?.company_id, isSuperAdmin: user?.is_super_admin });
      
      setSearchResults({
        properties,
        users,
        documents: documents.slice(0, 3)
      });
    };
    fetchResults();
  }, [debouncedSearchQuery, user]);

  const hasResults = searchResults.properties.length > 0 || searchResults.users.length > 0 || searchResults.documents.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    onClose?.();
  };

  return (
    <div className="relative max-w-md w-full group hidden lg:block">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all" />
      <Input
        placeholder="Sincronização global... (Ctrl+K)"
        className="pl-11 h-11 bg-muted/20 border-none rounded-2xl font-bold placeholder:font-medium transition-all focus-visible:ring-primary/20 w-full"
        value={searchQuery}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (e.target.value.length >= 2) setIsSearchOpen(true);
        }}
        onFocus={() => setIsSearchOpen(true)}
        autoComplete="off"
        spellCheck={false}
      />
      
      {isSearchOpen && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setIsSearchOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card rounded-2xl shadow-sem-xl border border-border/40 animate-in fade-in zoom-in-95 duration-200">
            <ScrollArea className="max-h-[400px]">
              {hasResults ? (
                <div className="p-2 space-y-4">
                  {searchResults.properties.length > 0 && (
                    <div>
                      <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                        <Building size={12} /> Empreendimentos
                      </p>
                      {searchResults.properties.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => handleNavigate('/admin/properties')}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 group transition-all"
                        >
                          <span className="font-bold text-sm text-foreground/80 group-hover:text-primary">{p.name}</span>
                          <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.users.length > 0 && (
                    <div>
                      <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                        <Users size={12} /> Usuários
                      </p>
                      {searchResults.users.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => handleNavigate('/admin/users')}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 group transition-all"
                        >
                          <div className="text-left">
                            <p className="font-bold text-sm text-foreground/80 group-hover:text-primary">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">{u.email}</p>
                          </div>
                          <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.documents.length > 0 && (
                    <div>
                      <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                        <FileText size={12} /> Documentos
                      </p>
                      {searchResults.documents.map(d => (
                        <button 
                          key={d.id}
                          onClick={() => handleNavigate('/admin/documents')}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 group transition-all"
                        >
                          <span className="font-bold text-sm text-foreground/80 group-hover:text-primary">{d.title}</span>
                          <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-10 text-center space-y-2">
                  <Search className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-sem-body-sm font-black text-muted-foreground/40 uppercase tracking-widest">
                    {searchQuery.length < 2 ? "Aguardando diretriz de pesquisa" : "Nenhum protocolo localizado"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

/** Conservative editorial grouping; no inference from campaign names. */
export const searchTopics = [
  {id:'brand',label:'Sonio & Marke'},
  {id:'cloud',label:'Cloud & Infrastruktur'},
  {id:'workplace',label:'Digital Workplace'},
  {id:'data',label:'Datenmanagement & Storage'},
  {id:'security',label:'Business Continuity & Security'},
  {id:'services',label:'Services & Beratung'},
  {id:'people',label:'Karriere & Personen'},
  {id:'other',label:'Weitere / noch nicht zugeordnet'},
] as const;
export type SearchTopic = typeof searchTopics[number]['id'];
const rules: [SearchTopic, RegExp][] = [
 ['cloud', /\b(cloud|infrastruktur|infrastructure|server|serveur|serveurs|datacenter|rechenzentrum|compute|vmware|broadcom|vcf)\b/],
 ['workplace', /\b(workplace|arbeitsplatz|arbeitsplatze|workspaces?|citrix|omnissa|vdi|desktop|modern work|poste de travail|postes de travail)\b/],
 ['data', /\b(storage|stockage|datenmanagement|datamanagement|data management|gestion des donnees|enterprise vault|archivierung|archivage|netapp)\b/],
 ['security', /\b(security|securite|cybersecurity|cybersecurite|cybersicherheit|sicherheit|backup|backups|sauvegarde|sauvegardes|ransomware|disaster recovery|business continuity|continuite|cohesity|veeam)\b/],
 ['services', /\b(services?|beratung|consulting|conseil|conseils|infogerance|support|outsourcing|assessment|maintenance|wartung|rollout)\b/],
 ['people', /\b(jobs?|karriere|careers?|emploi|emplois|recrutement|stellen|lehrstelle|lehrstellen|ausbildung|apprentissage|team|equipe)\b/],
];
export function searchTopic(term:string): SearchTopic {
 const text=term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-_/]/g,' ');
 const matches=rules.filter(([,rule])=>rule.test(text)).map(([id])=>id);
 // Generic service words do not override an explicitly named subject.
 const specific=matches.filter(id=>id!=='services');
 if(specific.length===1) return specific[0];
 if(specific.length>1) return 'other';
 if(matches.length) return matches[0];
 if(/\bsonio\b/.test(text)) return 'brand';
 return 'other';
}
export function topicTotals<T extends {term:string;clicks:number;impressions:number}>(rows:T[]) {
 return searchTopics.map(topic=>{
  const members=rows.filter(row=>searchTopic(row.term)===topic.id);
  return {...topic,count:members.length,clicks:members.reduce((sum,r)=>sum+r.clicks,0),impressions:members.reduce((sum,r)=>sum+r.impressions,0)};
 });
}

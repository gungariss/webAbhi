import { notFound } from 'next/navigation';
import { StudyPage } from '../../../components/study';
export default async function Page({params}){
  const {id}=await params;
  if(id!=='demo'&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
  return <StudyPage id={id}/>;
}

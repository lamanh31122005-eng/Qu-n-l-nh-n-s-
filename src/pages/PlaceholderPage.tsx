import PageHeader from '@/components/shared/PageHeader';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div>
    <PageHeader title={title} description={description} />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-muted-foreground"
    >
      <Construction size={48} className="mb-4 opacity-50" />
      <p className="text-lg font-medium">Đang phát triển</p>
      <p className="text-sm">Chức năng này sẽ sớm được hoàn thiện</p>
    </motion.div>
  </div>
);

export default PlaceholderPage;

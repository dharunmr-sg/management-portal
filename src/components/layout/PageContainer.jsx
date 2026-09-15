export default function PageContainer({ children }) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {children}
    </div>
  );
}

export default function PageContainer({ children }) {
  return (
    <div className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
      {children}
    </div>
  );
}

import getCurrentUser from "@/app/actions/getCurrentUser";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/Footer";
import ClientOnly from "@/app/components/ClientOnly";
import Container from "@/app/components/Container";

export default async function layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="pb-20 pt-20">
      <Container>
          {children}
      </Container>
    </div>
  );
}

import { Hero } from '../components/home/Hero';
import { Services } from '../components/home/Services';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { Process } from '../components/home/Process';
// import { Pricing } from '../components/home/Pricing';
//import { Testimonials } from '../components/home/Testimonials';
import { LeadForm } from '../components/home/LeadForm';

export function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <Process />
      {/* <Pricing /> */}
      {/* <Testimonials /> */}
      <LeadForm />
    </>
  );
}
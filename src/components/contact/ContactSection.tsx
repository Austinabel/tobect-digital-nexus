
import ContactForm from '@/components/contact/ContactForm';
import ContactInformation from '@/components/contact/ContactInformation';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-tobecatBlue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ContactInformation />
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

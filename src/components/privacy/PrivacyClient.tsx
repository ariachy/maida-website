'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';

interface PrivacyClientProps {
  translations: any;
  locale: Locale;
}

const content = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy matters to us',
    lastUpdated: 'Last updated: February 2026',
    backToHome: 'Back to Home',
    sections: [
      {
        title: '1. Who We Are',
        paragraphs: [
          'Maída is a Mediterranean restaurant with Lebanese influences, located at Rua da Boavista 66, Cais do Sodré, 1200-068 Lisboa, Portugal.',
          'For any questions about this privacy policy or how we handle your data, you can reach us at info@maida.pt.',
        ],
      },
      {
        title: '2. What Data We Collect',
        paragraphs: [
          'We collect different types of information depending on how you interact with our website and services:',
        ],
        list: [
          'Contact information (name, email, phone number) when you submit our contact or catering inquiry forms',
          'Reservation data processed through our third-party reservation partner, TheFork',
          'Feedback and reviews you voluntarily submit through our review system',
          'Website usage data through cookies and analytics tools (with your consent)',
          'Technical data such as browser type, device information, and IP address for security and performance purposes',
        ],
      },
      {
        title: '3. How We Use Your Data',
        paragraphs: [
          'We use your personal data for the following purposes:',
        ],
        list: [
          'To respond to your inquiries and manage reservations',
          'To process catering requests',
          'To improve our website and services based on usage patterns',
          'To measure the effectiveness of our advertising campaigns',
          'To ensure the security and proper functioning of our website',
        ],
      },
      {
        title: '4. Cookies & Tracking',
        paragraphs: [
          'Our website uses cookies to enhance your experience. We categorise cookies as follows:',
        ],
        list: [
          'Essential cookies: Required for the website to function properly. These cannot be disabled.',
          'Analytics cookies: Help us understand how visitors interact with our website through Google Analytics 4 (GA4). Only activated with your consent.',
          'Functional cookies: Enable enhanced features such as the reservation widget. Only activated with your consent.',
          'Advertising cookies: Used by Google Ads to measure campaign performance and deliver relevant advertisements. Only activated with your consent.',
        ],
        paragraphsAfter: [
          'When you first visit our website, a cookie consent banner will appear allowing you to accept, reject, or customise your cookie preferences. You can change your preferences at any time by clicking "Cookie Settings" in the website footer.',
          'We use Google Tag Manager (GTM) with Consent Mode, which means no tracking cookies are set until you provide your consent.',
        ],
      },
      {
        title: '5. Third-Party Services',
        paragraphs: [
          'We use the following third-party services that may process your data:',
        ],
        list: [
          'Google Analytics 4 (GA4) — website analytics and visitor statistics',
          'Google Tag Manager (GTM) — tag management with consent mode integration',
          'Google Ads — advertising campaign measurement and remarketing',
          'TheFork — online table reservations (thefork.pt)',
          'Google reCAPTCHA — spam protection on our contact and catering forms',
        ],
        paragraphsAfter: [
          'Each of these services has its own privacy policy governing the data they collect. We encourage you to review their respective privacy policies.',
        ],
      },
      {
        title: '6. Data Retention',
        paragraphs: [
          'We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected. Contact form submissions are retained for up to 12 months. Analytics data is retained according to the default settings of Google Analytics.',
        ],
      },
      {
        title: '7. Your Rights (GDPR)',
        paragraphs: [
          'Under the General Data Protection Regulation (GDPR), you have the following rights regarding your personal data:',
        ],
        list: [
          'Right of access — request a copy of the personal data we hold about you',
          'Right to rectification — request correction of inaccurate data',
          'Right to erasure — request deletion of your personal data',
          'Right to restrict processing — request limitation of how we use your data',
          'Right to data portability — request transfer of your data to another service',
          'Right to object — object to processing of your personal data',
          'Right to withdraw consent — withdraw your consent at any time for cookie and tracking preferences',
        ],
        paragraphsAfter: [
          'To exercise any of these rights, please contact us at info@maida.pt. We will respond to your request within 30 days.',
          'You also have the right to lodge a complaint with the Portuguese Data Protection Authority (CNPD) at www.cnpd.pt.',
        ],
      },
      {
        title: '8. Data Security',
        paragraphs: [
          'We take appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Our website uses HTTPS encryption for all data transmission.',
        ],
      },
      {
        title: '9. Children\'s Privacy',
        paragraphs: [
          'Our website is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, please contact us at info@maida.pt so we can promptly delete it.',
        ],
      },
      {
        title: '10. Changes to This Policy',
        paragraphs: [
          'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.',
        ],
      },
      {
        title: '11. Contact Us',
        paragraphs: [
          'If you have any questions about this privacy policy or our data practices, please contact us:',
        ],
        list: [
          'Email: info@maida.pt',
          'Address: Rua da Boavista 66, Cais do Sodré, 1200-068 Lisboa, Portugal',
        ],
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    subtitle: 'A sua privacidade é importante para nós',
    lastUpdated: 'Última atualização: Fevereiro 2026',
    backToHome: 'Voltar ao Início',
    sections: [
      {
        title: '1. Quem Somos',
        paragraphs: [
          'O Maída é um restaurante mediterrânico com influências libanesas, situado na Rua da Boavista 66, Cais do Sodré, 1200-068 Lisboa, Portugal.',
          'Para qualquer questão sobre esta política de privacidade ou sobre o tratamento dos seus dados, pode contactar-nos através de info@maida.pt.',
        ],
      },
      {
        title: '2. Que Dados Recolhemos',
        paragraphs: [
          'Recolhemos diferentes tipos de informação consoante a forma como interage com o nosso website e serviços:',
        ],
        list: [
          'Informações de contacto (nome, email, telefone) quando submete os nossos formulários de contacto ou de catering',
          'Dados de reserva processados através do nosso parceiro de reservas, TheFork',
          'Feedback e avaliações que submete voluntariamente através do nosso sistema de avaliações',
          'Dados de utilização do website através de cookies e ferramentas de análise (com o seu consentimento)',
          'Dados técnicos como tipo de navegador, informações do dispositivo e endereço IP para fins de segurança e desempenho',
        ],
      },
      {
        title: '3. Como Utilizamos os Seus Dados',
        paragraphs: [
          'Utilizamos os seus dados pessoais para os seguintes fins:',
        ],
        list: [
          'Para responder às suas questões e gerir reservas',
          'Para processar pedidos de catering',
          'Para melhorar o nosso website e serviços com base em padrões de utilização',
          'Para medir a eficácia das nossas campanhas publicitárias',
          'Para garantir a segurança e o bom funcionamento do nosso website',
        ],
      },
      {
        title: '4. Cookies e Rastreamento',
        paragraphs: [
          'O nosso website utiliza cookies para melhorar a sua experiência. Categorizamos os cookies da seguinte forma:',
        ],
        list: [
          'Cookies essenciais: Necessários para o funcionamento do website. Não podem ser desativados.',
          'Cookies de análise: Ajudam-nos a compreender como os visitantes interagem com o nosso website através do Google Analytics 4 (GA4). Apenas ativados com o seu consentimento.',
          'Cookies funcionais: Permitem funcionalidades melhoradas como o widget de reservas. Apenas ativados com o seu consentimento.',
          'Cookies de publicidade: Utilizados pelo Google Ads para medir o desempenho de campanhas e apresentar anúncios relevantes. Apenas ativados com o seu consentimento.',
        ],
        paragraphsAfter: [
          'Quando visita o nosso website pela primeira vez, aparecerá um banner de consentimento de cookies que lhe permite aceitar, rejeitar ou personalizar as suas preferências de cookies. Pode alterar as suas preferências a qualquer momento clicando em "Definições de Cookies" no rodapé do website.',
          'Utilizamos o Google Tag Manager (GTM) com Modo de Consentimento, o que significa que nenhum cookie de rastreamento é definido até que dê o seu consentimento.',
        ],
      },
      {
        title: '5. Serviços de Terceiros',
        paragraphs: [
          'Utilizamos os seguintes serviços de terceiros que podem processar os seus dados:',
        ],
        list: [
          'Google Analytics 4 (GA4) — análise do website e estatísticas de visitantes',
          'Google Tag Manager (GTM) — gestão de tags com integração de modo de consentimento',
          'Google Ads — medição de campanhas publicitárias e remarketing',
          'TheFork — reservas de mesa online (thefork.pt)',
          'Google reCAPTCHA — proteção contra spam nos nossos formulários de contacto e catering',
        ],
        paragraphsAfter: [
          'Cada um destes serviços tem a sua própria política de privacidade que rege os dados que recolhem. Encorajamos a consulta das respetivas políticas de privacidade.',
        ],
      },
      {
        title: '6. Retenção de Dados',
        paragraphs: [
          'Retemos os seus dados pessoais apenas pelo tempo necessário para cumprir os fins para os quais foram recolhidos. As submissões de formulários de contacto são retidas por até 12 meses. Os dados de análise são retidos de acordo com as configurações padrão do Google Analytics.',
        ],
      },
      {
        title: '7. Os Seus Direitos (RGPD)',
        paragraphs: [
          'Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD), tem os seguintes direitos relativamente aos seus dados pessoais:',
        ],
        list: [
          'Direito de acesso — solicitar uma cópia dos dados pessoais que detemos sobre si',
          'Direito de retificação — solicitar a correção de dados imprecisos',
          'Direito ao apagamento — solicitar a eliminação dos seus dados pessoais',
          'Direito à limitação do tratamento — solicitar a limitação da forma como utilizamos os seus dados',
          'Direito à portabilidade dos dados — solicitar a transferência dos seus dados para outro serviço',
          'Direito de oposição — opor-se ao tratamento dos seus dados pessoais',
          'Direito de retirar o consentimento — retirar o seu consentimento a qualquer momento para preferências de cookies e rastreamento',
        ],
        paragraphsAfter: [
          'Para exercer qualquer um destes direitos, por favor contacte-nos através de info@maida.pt. Responderemos ao seu pedido no prazo de 30 dias.',
          'Tem também o direito de apresentar uma reclamação junto da Comissão Nacional de Proteção de Dados (CNPD) em www.cnpd.pt.',
        ],
      },
      {
        title: '8. Segurança dos Dados',
        paragraphs: [
          'Tomamos medidas técnicas e organizacionais adequadas para proteger os seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. O nosso website utiliza encriptação HTTPS para toda a transmissão de dados.',
        ],
      },
      {
        title: '9. Privacidade de Menores',
        paragraphs: [
          'O nosso website não se destina a crianças com idade inferior a 16 anos. Não recolhemos intencionalmente dados pessoais de crianças. Se acredita que recolhemos inadvertidamente dados de uma criança, por favor contacte-nos através de info@maida.pt para que possamos eliminá-los prontamente.',
        ],
      },
      {
        title: '10. Alterações a Esta Política',
        paragraphs: [
          'Podemos atualizar esta política de privacidade periodicamente. Quaisquer alterações serão publicadas nesta página com uma data de revisão atualizada. Encorajamos a revisão periódica desta política.',
        ],
      },
      {
        title: '11. Contacte-nos',
        paragraphs: [
          'Se tiver alguma questão sobre esta política de privacidade ou sobre as nossas práticas de dados, por favor contacte-nos:',
        ],
        list: [
          'Email: info@maida.pt',
          'Morada: Rua da Boavista 66, Cais do Sodré, 1200-068 Lisboa, Portugal',
        ],
      },
    ],
  },
};

export default function PrivacyClient({ translations, locale }: PrivacyClientProps) {
  const t = content[locale] || content.en;

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
    },
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 px-6 bg-charcoal text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-terracotta blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-sage blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-sand/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToHome}
            </Link>
          </motion.div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-[1.1]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              >
                {t.title}
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-lg text-sand/70 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t.subtitle}
          </motion.p>

          <motion.p
            className="text-sm text-sand/50 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {t.lastUpdated}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <article className="py-12 md:py-20 px-6">
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
        >
          {t.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-10">
              <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-6">
                {section.title}
              </h2>

              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-stone text-lg leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}

              {section.list && (
                <ul className="space-y-3 mb-6 ml-4">
                  {section.list.map((item, lIndex) => (
                    <li
                      key={lIndex}
                      className="text-stone text-lg leading-relaxed flex items-start gap-3"
                    >
                      <span className="text-terracotta mt-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.paragraphsAfter?.map((paragraph, paIndex) => (
                <p key={paIndex} className="text-stone text-lg leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </motion.div>
      </article>
    </div>
  );
}

import type { LocalizedString } from './products';

export interface FocusArea {
  title: LocalizedString;
  description: LocalizedString;
}

export interface TeamMember {
  name: string;
  role: LocalizedString;
  avatar?: string;
  bio?: LocalizedString;
}

export interface StackGroup {
  label: LocalizedString;
  items: string[];
}

export interface PracticeItem {
  id: string;
  title: LocalizedString;
  body: LocalizedString;
  image: string;
  imageAlt: LocalizedString;
  image2?: string;
  image2Alt?: LocalizedString;
  frame: 'phone' | 'wide';
}

export interface StoryEra {
  id: string;
  period: LocalizedString;
  title: LocalizedString;
  body?: LocalizedString;
  range?: [string, string];
  image?: string;
  imageAlt?: LocalizedString;
  plans?: LocalizedString[];
  logo?: boolean;
  stats?: boolean;
}

export interface AboutContent {
  meta: { title: LocalizedString; description: LocalizedString };
  hero: {
    eyebrow: LocalizedString;
    titleLines: LocalizedString[];
    lede: LocalizedString;
    shotAlt: LocalizedString;
  };
  intro: {
    heading: LocalizedString;
    paragraphs: LocalizedString[];
    mission: LocalizedString;
    place: LocalizedString;
  };
  statement: LocalizedString;
  halves: {
    heading: LocalizedString;
    own: { title: LocalizedString; lede: LocalizedString; invest: LocalizedString };
    client: {
      title: LocalizedString;
      lede: LocalizedString;
      caption: LocalizedString;
      nda: LocalizedString;
    };
  };
  practice: {
    heading: LocalizedString;
    items: PracticeItem[];
    stackHeading: LocalizedString;
    stack: StackGroup[];
  };
  story: {
    heading: LocalizedString;
    lede: LocalizedString;
    today: LocalizedString;
    prev: LocalizedString;
    next: LocalizedString;
    eras: StoryEra[];
  };
  closing: { heading: LocalizedString; lede: LocalizedString };
  cta: { brief: LocalizedString; journey: LocalizedString; products: LocalizedString };
  focusAreas: FocusArea[];
  teamMembers: TeamMember[];
}

export const about: AboutContent = {
  meta: {
    title: { vi: 'Về chúng tôi', en: 'About' },
    description: {
      vi: 'RideLink Techs là công ty phần mềm độc lập ở Đà Nẵng. Chúng tôi tự phát triển sản phẩm riêng, nhận xây phần mềm theo yêu cầu và bàn giao đầy đủ mã nguồn cùng tài liệu kỹ thuật.',
      en: 'RideLink Techs is an independent software company in Da Nang. We build our own products, take on custom software projects, and hand over the full source code and technical documentation.',
    },
  },
  hero: {
    eyebrow: { vi: 'Về chúng tôi', en: 'About us' },
    titleLines: [
      { vi: 'Chúng tôi xây sản phẩm.', en: 'We build products.' },
      { vi: 'Của mình, và của bạn.', en: 'Ours, and yours.' },
    ],
    lede: {
      vi: 'Công ty phần mềm độc lập ở Đà Nẵng. Chúng tôi tự phát triển sản phẩm riêng và nhận xây phần mềm theo yêu cầu.',
      en: 'An independent software company in Da Nang. We develop our own products and build custom software for clients.',
    },
    shotAlt: { vi: 'giao diện thật của ứng dụng', en: 'real app interface' },
  },
  intro: {
    heading: { vi: 'Giới thiệu công ty.', en: 'About the company.' },
    paragraphs: [
      {
        vi: 'RideLink Techs là một startup phần mềm nhỏ tại Đà Nẵng, do người sáng lập của PSDev Group thành lập năm 2025. PSDev Group là nhóm freelance làm việc cùng nhau từ năm 2019.',
        en: 'RideLink Techs is a small software startup in Da Nang, founded in 2025 by the founder of PSDev Group, a freelance team that has worked together since 2019.',
      },
      {
        vi: 'Là một startup nhỏ, chúng tôi tự xây sản phẩm của mình, nhận xây phần mềm cho khách hàng, và công khai trạng thái thật của từng sản phẩm, kể cả khi nó chưa sẵn sàng.',
        en: 'As a small startup, we build our own products, take on software projects for clients, and publish the real status of each product, including when it is not ready.',
      },
    ],
    mission: {
      vi: 'Sứ mệnh của chúng tôi là xây phần mềm đáng tin cậy cho người dùng Việt Nam, và làm việc ở một nơi mà kỹ sư có thể đi cùng sản phẩm của mình nhiều năm, thay vì nhiều sprint.',
      en: 'Our mission is to build software Vietnamese users can rely on, and to work somewhere an engineer can stay with their product for years instead of sprints.',
    },
    place: { vi: 'Đà Nẵng, Việt Nam', en: 'Da Nang, Vietnam' },
  },
  statement: {
    vi: 'Một sản phẩm chỉ thật sự thuộc về bạn khi bạn hiểu nó, vận hành được nó và không bị ràng buộc vào người đã xây ra nó.',
    en: 'A product only truly belongs to you when you understand it, can run it, and are not tied to whoever built it.',
  },
  halves: {
    heading: {
      vi: 'Hai việc, cùng một cách làm.',
      en: 'Two kinds of work, one way of working.',
    },
    own: {
      title: { vi: 'Sản phẩm của chúng tôi', en: 'Our products' },
      lede: {
        vi: 'Chúng tôi tự chọn bài toán, tự thiết kế và tự xây. Mỗi sản phẩm bắt đầu từ một vấn đề có thật của người dùng Việt Nam.',
        en: 'We choose the problems, design the answers and build them ourselves. Each product starts from a real problem faced by Vietnamese users.',
      },
      invest: {
        vi: 'Chúng tôi đang tìm nhà đầu tư và đối tác để cùng phát triển, mở rộng các sản phẩm này.',
        en: 'We are looking for investors and partners to develop and expand these products with us.',
      },
    },
    client: {
      title: { vi: 'Dự án cho khách hàng', en: 'Projects for clients' },
      lede: {
        vi: 'Chúng tôi nhận xây phần mềm theo yêu cầu trên mobile (iOS, Android), web, desktop và backend.',
        en: 'We build custom software for mobile (iOS, Android), web, desktop and backend.',
      },
      caption: {
        vi: 'VibeHolic: website cho một agency media tại Đà Nẵng, đã bàn giao.',
        en: 'VibeHolic: a website for a media agency in Da Nang, delivered.',
      },
      nda: {
        vi: 'Tên khách hàng và phạm vi hợp tác được giữ kín theo thỏa thuận bảo mật hai chiều.',
        en: 'The client’s name and the scope of our work are kept private under a mutual NDA.',
      },
    },
  },
  practice: {
    heading: { vi: 'Cách chúng tôi làm việc.', en: 'How we work.' },
    items: [
      {
        id: 'build',
        title: { vi: 'Tự xây.', en: 'We build it.' },
        body: {
          vi: 'Từ phân tích, thiết kế đến lập trình, chúng tôi xây từng hệ thống theo đặc thù của bài toán, để chạy ổn định và mở rộng được khi người dùng tăng lên.',
          en: 'From analysis and design to code, we build each system around the specifics of the problem, so it runs reliably and can grow as users do.',
        },
        image: '/products/screens/ridelink-go-03-booking.jpg',
        imageAlt: {
          vi: 'Màn hình đặt xe của Ridelink Go, hiển thị giá và thời gian đón trước khi đặt.',
          en: 'Ridelink Go booking screen, showing the fare and pickup time before booking.',
        },
        frame: 'phone',
      },
      {
        id: 'run',
        title: { vi: 'Tự chạy.', en: 'We run it.' },
        body: {
          vi: 'Ra mắt chưa phải điểm kết thúc. Chúng tôi đồng hành qua triển khai, vận hành và bảo trì, và khi bạn cần, nhận quản lý hạ tầng, giám sát và xử lý sự cố. Ridelink Go ghép chuyến theo thời gian thực, nên chúng tôi buộc phải nghĩ đến vận hành ngay từ ngày đầu.',
          en: 'Launch is not the finish line. We stay through deployment, operation and maintenance, and when you need it, we take on infrastructure, monitoring and incident handling. Ridelink Go matches rides in real time, so we had to think about operations from day one.',
        },
        image: '/products/screens/ridelink-go-07-driver.jpg',
        imageAlt: {
          vi: 'Ứng dụng tài xế của Ridelink Go, hiển thị trạng thái hoạt động, thống kê trong ngày và chuyến đang chạy.',
          en: 'Ridelink Go driver app, showing active status, today’s stats and the current trip.',
        },
        frame: 'phone',
      },
      {
        id: 'handover',
        title: { vi: 'Bàn giao thật.', en: 'We hand it over.' },
        body: {
          vi: 'Phạm vi, chi phí, tiến độ và quyền sở hữu được thống nhất rõ từ đầu, dưới một thỏa thuận bảo mật. Khi bàn giao, bạn nhận đủ mã nguồn, tài liệu kỹ thuật và hướng dẫn vận hành để tự quản lý và phát triển tiếp, không phụ thuộc vào đội ngũ ban đầu. Kể cả không phụ thuộc vào chúng tôi.',
          en: 'Scope, cost, timeline and ownership are agreed clearly up front, under a confidentiality agreement. At handover you receive the full source code, technical documentation and an operations guide, so you can run and extend the product without relying on the original team. Including us.',
        },
        image: '/products/screens/vibeholic-01-home.jpg',
        imageAlt: {
          vi: 'Trang chủ website VibeHolic do chúng tôi xây và bàn giao.',
          en: 'The home page of the VibeHolic website we built and delivered.',
        },
        image2: '/products/screens/vibeholic-02.jpg',
        image2Alt: {
          vi: 'Trang bảng giá công khai trên website VibeHolic.',
          en: 'The public price list on the VibeHolic website.',
        },
        frame: 'wide',
      },
    ],
    stackHeading: { vi: 'Công nghệ chúng tôi dùng', en: 'What we build with' },
    stack: [
      {
        label: { vi: 'Web', en: 'Web' },
        items: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'shadcn/ui', 'GSAP'],
      },
      {
        label: { vi: 'Mobile', en: 'Mobile' },
        items: ['React Native', 'Flutter', 'Dart', 'Swift', 'Kotlin'],
      },
      {
        label: { vi: 'Backend', en: 'Backend' },
        items: [
          'Node.js',
          'Next.js',
          'NestJS',
          'Supabase',
          'Firebase',
          'Postgres',
          'Edge functions',
        ],
      },
      {
        label: { vi: 'Thiết kế', en: 'Design' },
        items: ['Figma', 'Linear', 'Notion'],
      },
      {
        label: { vi: 'Triển khai', en: 'Delivery' },
        items: ['GitHub Actions', 'Vercel', 'Docker'],
      },
    ],
  },
  story: {
    heading: { vi: 'Hành trình của chúng tôi.', en: 'Our journey.' },
    lede: {
      vi: 'Từ những năm làm freelance trong thời gian rảnh đến một startup có sản phẩm của riêng mình.',
      en: 'From years of freelancing in spare time to a startup with products of its own.',
    },
    today: { vi: 'Hôm nay', en: 'Today' },
    prev: { vi: 'Chặng trước', en: 'Previous stage' },
    next: { vi: 'Chặng sau', en: 'Next stage' },
    eras: [
      {
        id: 'freelance',
        period: { vi: '2019 - 2024', en: '2019 - 2024' },
        title: { vi: 'Khởi đầu là PSDev Group', en: 'It began as PSDev Group' },
        body: {
          vi: 'Chúng tôi bắt đầu là một nhóm freelance nhỏ mang tên PSDev Group. Mỗi thành viên có công việc riêng và nhận thêm dự án trong thời gian rảnh. Những năm làm phần mềm cho khách hàng đã giúp chúng tôi có nền tảng kỹ thuật vững, và thói quen làm việc rõ ràng, đúng hẹn.',
          en: 'We began as a small freelance team called PSDev Group. Each member had a day job and took on projects in their spare time. Those years of building software for clients gave us solid technical footing, and the habit of working clearly and on time.',
        },
      },
      {
        id: 'idea',
        period: { vi: '2024', en: '2024' },
        title: {
          vi: 'Một câu hỏi, những ý tưởng đầu tiên',
          en: 'A question, then the first ideas',
        },
        body: {
          vi: 'Nhiều năm xây phần mềm khi vẫn chỉ mang danh nghĩa một nhóm, chúng tôi gặp không ít hạn chế và chưa có sản phẩm nào của riêng mình. Chúng tôi tự hỏi: vì sao không tự phát triển một sản phẩm và tự vận hành nó? Người sáng lập nhóm, cũng là người sáng lập công ty hôm nay, đưa ra những ý tưởng đầu tiên: một ứng dụng xe ghép, tiền thân của Ridelink Go, và không lâu sau là GlossLink Beautiful cho các salon làm đẹp.',
          en: 'For years we built software as nothing more than a team, with real limits and no product of our own. So we asked ourselves: why not build a product and run it ourselves? The team’s founder, who also founded the company we are today, brought the first ideas: a shared-ride app that became Ridelink Go, and soon after, GlossLink Beautiful for beauty salons.',
        },
        range: ['2024-01', '2024-12'],
        image: '/products/screens/ridelink-go-02-search.jpg',
        imageAlt: {
          vi: 'Màn hình tìm chuyến xe ghép trong Ridelink Go.',
          en: 'The shared-ride search screen in Ridelink Go.',
        },
      },
      {
        id: 'refine',
        period: { vi: '2024 - 2025', en: '2024 - 2025' },
        title: {
          vi: 'Trau chuốt trước khi xây',
          en: 'Refining before building',
        },
        body: {
          vi: 'Một dịch vụ gọi xe cần nhiều hơn một ứng dụng: cần cả một bộ máy vận hành và nền tảng vững phía sau. Vì vậy chúng tôi không vội ra mắt, mà dành thời gian trau chuốt ý tưởng ban đầu từng chút một, từ cách ghép chuyến đến cách tài xế và hành khách thương lượng giá, cho đến khi sẵn sàng bắt tay vào xây.',
          en: 'A ride service needs more than an app: it needs an operation and solid groundwork behind it. So we did not rush to launch. We took the time to refine the original idea piece by piece, from how rides are matched to how drivers and riders agree on a fare, until we were ready to start building.',
        },
        image: '/products/screens/ridelink-go-05-activity.jpg',
        imageAlt: {
          vi: 'Màn hình hoạt động trong Ridelink Go, với các chuyến xe ghép đang tìm tài xế và thương lượng giá.',
          en: 'The activity screen in Ridelink Go, with shared rides looking for drivers and negotiating fares.',
        },
      },
      {
        id: 'company',
        period: { vi: '2025', en: '2025' },
        title: { vi: 'RideLink Techs ra đời', en: 'RideLink Techs is founded' },
        body: {
          vi: 'Năm 2025, người sáng lập chính thức thành lập RideLink Techs, một startup phần mềm nhỏ tại Đà Nẵng. Cũng trong năm đó, Ridelink Go bước vào giai đoạn phát triển, với ghép chuyến theo thời gian thực, theo dõi chuyến đi trên bản đồ và giá hiển thị trước khi đặt.',
          en: 'In 2025 the founder established RideLink Techs, a small software startup in Da Nang. The same year, Ridelink Go moved into development, with real-time ride matching, live trip tracking on a map and fares shown before booking.',
        },
        range: ['2025-01', '2025-12'],
        image: '/products/screens/ridelink-go-06-trips.jpg',
        imageAlt: {
          vi: 'Danh sách chuyến đi trong Ridelink Go, gồm chuyến đặt trước và đơn gửi hàng.',
          en: 'The trips list in Ridelink Go, with booked rides and deliveries.',
        },
        logo: true,
      },
      {
        id: 'growth',
        period: { vi: '2026', en: '2026' },
        title: { vi: 'Một năm mở rộng', en: 'A year of expanding' },
        body: {
          vi: 'GlossLink Beautiful và Pawly bước vào giai đoạn phát triển. Tháng 7, chúng tôi bàn giao VibeHolic, website cho một agency media tại Đà Nẵng.',
          en: 'GlossLink Beautiful and Pawly moved into development. In July we delivered VibeHolic, a website for a media agency in Da Nang.',
        },
        range: ['2026-01', '2026-12'],
        stats: true,
      },
      {
        id: 'next',
        period: { vi: 'Tiếp theo', en: 'Next' },
        title: { vi: 'Những việc phía trước', en: 'What comes next' },
        plans: [
          {
            vi: 'Hoàn thiện Ridelink Go để mở bản beta giới hạn.',
            en: 'Finish Ridelink Go and open a limited beta.',
          },
          {
            vi: 'Đưa GlossLink Beautiful và Pawly đến tay người dùng.',
            en: 'Bring GlossLink Beautiful and Pawly to users.',
          },
          {
            vi: 'Tìm nhà đầu tư và đối tác để cùng mở rộng các sản phẩm.',
            en: 'Find investors and partners to grow the products with us.',
          },
          {
            vi: 'Tiếp tục nhận dự án cho khách hàng, với cùng một tiêu chuẩn.',
            en: 'Keep taking on client projects, to the same standard.',
          },
        ],
      },
    ],
  },
  closing: {
    heading: {
      vi: 'Bạn cần xây phần mềm, hay muốn đồng hành cùng sản phẩm của chúng tôi?',
      en: 'Need software built, or want to build our products with us?',
    },
    lede: {
      vi: 'Gửi cho chúng tôi một brief ngắn. Nếu bạn muốn, chúng tôi ký NDA trước buổi trao đổi đầu tiên, và trả lời trong một ngày làm việc.',
      en: 'Send us a short brief. If you like, we sign an NDA before the first conversation, and we reply within one working day.',
    },
  },
  cta: {
    brief: { vi: 'Gửi brief', en: 'Send a brief' },
    journey: { vi: 'Xem hành trình', en: 'See our journey' },
    products: { vi: 'Xem sản phẩm', en: 'See the work' },
  },
  focusAreas: [
    {
      title: {
        vi: 'Giải pháp công nghệ toàn diện, đa nền tảng',
        en: 'Complete technology solutions, multi platform',
      },
      description: {
        vi: 'Chúng tôi cung cấp dịch vụ phát triển phần mềm trên nhiều nền tảng, bao gồm Mobile (iOS, Android), Web, Desktop và Backend. Mỗi giải pháp được thiết kế dựa trên đặc thù nghiệp vụ, với kiến trúc phù hợp, hiệu năng tối ưu, khả năng mở rộng và tính ổn định, đáp ứng nhu cầu vận hành thực tế.',
        en: 'We provide software development across multiple platforms: Mobile (iOS, Android), Web, Desktop and Backend. Each solution is designed around the specifics of the work, with suitable architecture, optimised performance, scalability and stability, meeting real operational demands.',
      },
    },
    {
      title: {
        vi: 'Chủ động phát triển sản phẩm riêng',
        en: 'Building our own products',
      },
      description: {
        vi: 'Bên cạnh các dự án theo yêu cầu, chúng tôi tự nghiên cứu và phát triển những sản phẩm công nghệ của riêng mình, từ ý tưởng đến triển khai thực tế. Mỗi sản phẩm đều hướng đến giải quyết những bài toán cụ thể, có định hướng phát triển dài hạn và tiềm năng thương mại hóa.',
        en: 'Alongside projects built to order, we research and develop our own technology products, from idea through to real implementation. Each product targets specific problems, with long-term development direction and commercialisation potential.',
      },
    },
    {
      title: {
        vi: 'Minh bạch trong hợp tác, rõ ràng về quyền sở hữu',
        en: 'Transparent collaboration, clear ownership',
      },
      description: {
        vi: 'Mọi dự án đều được xác định rõ phạm vi công việc, chi phí, tiến độ và quyền sở hữu ngay từ đầu. Chúng tôi đặt sự minh bạch và bảo mật thông tin làm nền tảng, đảm bảo quyền lợi của các bên trong suốt quá trình hợp tác.',
        en: 'Every project has its scope, cost, timeline and ownership clearly defined from the start. We place transparency and information security at the foundation, protecting the interests of all parties throughout the collaboration.',
      },
    },
    {
      title: {
        vi: 'Đồng hành xuyên suốt, làm chủ toàn bộ hệ thống',
        en: 'With you end to end, owning the whole system',
      },
      description: {
        vi: 'Chúng tôi đồng hành cùng khách hàng từ quá trình phân tích, phát triển, triển khai đến vận hành và bảo trì hệ thống. Tùy theo nhu cầu, chúng tôi có thể đảm nhận việc quản lý hạ tầng, giám sát và xử lý sự cố. Đồng thời, mã nguồn và tài liệu kỹ thuật được bàn giao đầy đủ theo thỏa thuận, giúp khách hàng chủ động quản lý, vận hành và tiếp tục phát triển sản phẩm mà không phụ thuộc vào đội ngũ ban đầu.',
        en: 'We work alongside clients from analysis, development and deployment through to operation and system maintenance. Depending on need, we can take on infrastructure management, monitoring and incident handling. At the same time, source code and technical documentation are handed over in full as agreed, helping clients independently manage, operate and continue developing the product without depending on the original team.',
      },
    },
  ],
  teamMembers: [],
};

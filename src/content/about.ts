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

export interface StackRow {
  label: LocalizedString;
  note: LocalizedString;
}

export interface AboutContent {
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  story: LocalizedString;
  mission: LocalizedString;
  focusAreas: FocusArea[];
  teamMembers: TeamMember[];
  stack: StackRow[];
}

export const about: AboutContent = {
  heroTitle: {
    vi: 'Một công ty phần mềm nhỏ ở Đà Nẵng.',
    en: 'A small software company in Da Nang.',
  },
  heroSubtitle: {
    vi: 'Dự án khách hàng bắt đầu bằng việc ký NDA, rồi đi kèm tài liệu kỹ thuật và toàn bộ mã nguồn khi bàn giao.',
    en: 'Client projects start with an NDA, and end with technical documentation and the full source code.',
  },
  story: {
    vi: 'RideLink Techs bắt đầu từ một quan sát khá giản dị: phần lớn phần mềm được dùng hằng ngày ở Việt Nam được xây ở nước ngoài, cho một bối cảnh khác, và hiếm khi giải quyết đúng vấn đề của người dùng Việt.\n\nChúng tôi là một nhóm nhỏ kỹ sư và thiết kế làm việc tại Đà Nẵng. Bốn sản phẩm hiện tại đều bắt nguồn từ những vấn đề rất cụ thể: khách gọi xe không biết giá trước khi đặt, tiệm làm đẹp thất lạc lịch hẹn, chủ chó mèo thiếu nơi tra cứu dịch vụ gần nhà, và tài xế gặp sự cố giữa đường phải chờ một cuộc gọi thứ hai để biết sẽ tới trong bao lâu.\n\nChúng tôi xây những thứ giải quyết đúng các vấn đề đó, và công khai trạng thái thật của từng sản phẩm — kể cả khi nó chưa sẵn sàng. Một danh mục trông khiêm tốn còn hơn một danh mục bịa số liệu.',
    en: 'RideLink Techs started from a fairly plain observation: most software used daily in Vietnam is built abroad, for a different context, and rarely solves the actual problem Vietnamese users have.\n\nWe are a small group of engineers and designers working in Da Nang. The four current products each come from a very specific problem: a ride-hailing customer who cannot see the price before booking, a salon that loses appointments, a dog or cat owner with nowhere local to look up services, and a rider who has broken down and has to make a second phone call to find out how long the wait will be.\n\nWe build things that solve those specific problems, and we publish the real status of each product — including when it is not ready. A modest catalogue beats an inflated one.',
  },
  mission: {
    vi: 'Xây phần mềm đáng tin cậy cho người dùng Việt Nam, và làm việc ở một nơi mà kỹ sư có thể đi cùng sản phẩm của mình nhiều năm, thay vì nhiều sprint.',
    en: 'Build software Vietnamese users can rely on, and work somewhere an engineer can stay with their product for years instead of sprints.',
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
  stack: [
    {
      label: { vi: 'Ứng dụng', en: 'Applications' },
      note: {
        vi: 'TypeScript · Next.js · React Native · Swift · Kotlin',
        en: 'TypeScript · Next.js · React Native · Swift · Kotlin',
      },
    },
    {
      label: { vi: 'Dữ liệu', en: 'Data' },
      note: {
        vi: 'Postgres · Supabase · Edge functions',
        en: 'Postgres · Supabase · Edge functions',
      },
    },
    {
      label: { vi: 'Thiết kế', en: 'Design' },
      note: { vi: 'Figma · Linear · Notion', en: 'Figma · Linear · Notion' },
    },
    {
      label: { vi: 'Triển khai', en: 'Delivery' },
      note: {
        vi: 'GitHub Actions · Vercel · Docker',
        en: 'GitHub Actions · Vercel · Docker',
      },
    },
  ],
};

export interface DivisionData {
  en: string;
  bn: string;
  districts: {
    en: string;
    bn: string;
    upazilas: { en: string; bn: string }[];
  }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    en: 'Dhaka',
    bn: 'ঢাকা',
    districts: [
      {
        en: 'Dhaka',
        bn: 'ঢাকা',
        upazilas: [
          { en: 'Dhanmondi', bn: 'ধানমন্ডি' },
          { en: 'Gulshan', bn: 'গুলশান' },
          { en: 'Uttara', bn: 'উত্তরা' },
          { en: 'Mirpur', bn: 'মিরপুর' },
          { en: 'Mohammadpur', bn: 'মোহাম্মদপুর' },
          { en: 'Badda', bn: 'বাড্ডা' },
          { en: 'Banani', bn: 'বনানী' },
          { en: 'Jatrabari', bn: 'যাত্রাবাড়ী' },
          { en: 'Khilgaon', bn: 'খিলগাঁও' },
          { en: 'Motijheel', bn: 'মতিঝিল' },
          { en: 'Ramna', bn: 'রমনা' },
          { en: 'Tejgaon', bn: 'তেজগাঁও' },
          { en: 'Savar', bn: 'সাভার' },
          { en: 'Keraniganj', bn: 'কেরানীগঞ্জ' },
          { en: 'Dhamrai', bn: 'ধামরাই' },
          { en: 'Dohar', bn: 'দোহার' },
          { en: 'Nawabganj', bn: 'নবাবগঞ্জ' }
        ]
      },
      {
        en: 'Gazipur',
        bn: 'গাজীপুর',
        upazilas: [
          { en: 'Gazipur Sadar', bn: 'গাজীপুর সদর' },
          { en: 'Tongi', bn: 'টঙ্গী' },
          { en: 'Kaliakair', bn: 'কালিয়াকৈর' },
          { en: 'Sreepur', bn: 'শ্রীপুর' },
          { en: 'Kapasia', bn: 'কাপাসিয়া' },
          { en: 'Kaliganj', bn: 'কালীগঞ্জ' }
        ]
      },
      {
        en: 'Kishoreganj',
        bn: 'কিশোরগঞ্জ',
        upazilas: [
          { en: 'Kishoreganj Sadar', bn: 'কিশোরগঞ্জ সদর' },
          { en: 'Bhairab', bn: 'ভৈরব' },
          { en: 'Bajitpur', bn: 'বাজিতপুর' },
          { en: 'Karimganj', bn: 'করিমগঞ্জ' },
          { en: 'Katiadi', bn: 'কটিয়াদী' },
          { en: 'Kuliarchar', bn: 'কুলিয়ারচর' },
          { en: 'Mithamain', bn: 'মিঠামইন' },
          { en: 'Nikli', bn: 'নিকলী' },
          { en: 'Ostagram', bn: 'অষ্টগ্রাম' },
          { en: 'Itna', bn: 'ইটনা' },
          { en: 'Pakundia', bn: 'পাকুন্দিয়া' },
          { en: 'Tarail', bn: 'তাড়াইল' }
        ]
      },
      {
        en: 'Manikganj',
        bn: 'মানিকগঞ্জ',
        upazilas: [
          { en: 'Manikganj Sadar', bn: 'মানিকগঞ্জ সদর' },
          { en: 'Singair', bn: 'সিঙ্গাইর' },
          { en: 'Saturia', bn: 'সাটুরিয়া' },
          { en: 'Shibalaya', bn: 'শিবালয়' },
          { en: 'Harirampur', bn: 'হরিরামপুর' },
          { en: 'Ghior', bn: 'ঘিওর' },
          { en: 'Daulatpur', bn: 'দৌলতপুর' }
        ]
      },
      {
        en: 'Munshiganj',
        bn: 'মুন্সিগঞ্জ',
        upazilas: [
          { en: 'Munshiganj Sadar', bn: 'মুন্সিগঞ্জ সদর' },
          { en: 'Gazaria', bn: 'গজারিয়া' },
          { en: 'Tongibari', bn: 'টঙ্গিবাড়ী' },
          { en: 'Sreenagar', bn: 'শ্রীনগর' },
          { en: 'Louhajang', bn: 'লৌহজং' },
          { en: 'Sirajdikhan', bn: 'সিরাজদিখান' }
        ]
      },
      {
        en: 'Narayanganj',
        bn: 'নারায়ণগঞ্জ',
        upazilas: [
          { en: 'Narayanganj Sadar', bn: 'নারায়ণগঞ্জ সদর' },
          { en: 'Siddhirganj', bn: 'সিদ্ধিরগঞ্জ' },
          { en: 'Rupganj', bn: 'রূপগঞ্জ' },
          { en: 'Araihazar', bn: 'আড়াইহাজার' },
          { en: 'Sonargaon', bn: 'সোনারগাঁও' },
          { en: 'Bandar', bn: 'বন্দর' }
        ]
      },
      {
        en: 'Narsingdi',
        bn: 'নরসিংদী',
        upazilas: [
          { en: 'Narsingdi Sadar', bn: 'নরসিংদী সদর' },
          { en: 'Palash', bn: 'পলাশ' },
          { en: 'Belabo', bn: 'বেলাবো' },
          { en: 'Monohardi', bn: 'মনোহরদী' },
          { en: 'Raipura', bn: 'রায়পুরা' },
          { en: 'Shibpur', bn: 'শিবপুর' }
        ]
      },
      {
        en: 'Faridpur',
        bn: 'ফরিদপুর',
        upazilas: [
          { en: 'Faridpur Sadar', bn: 'ফরিদপুর সদর' },
          { en: 'Bhanga', bn: 'ভাঙ্গা' },
          { en: 'Boalmari', bn: 'বোয়ালমারী' },
          { en: 'Alfadanga', bn: 'আলফাডাঙ্গা' },
          { en: 'Nagarkanda', bn: 'নগরকান্দা' },
          { en: 'Sadarpur', bn: 'সদরপুর' },
          { en: 'Charbhadrasan', bn: 'চরভদ্রাসন' },
          { en: 'Madhukhali', bn: 'মধুখালী' },
          { en: 'Saltha', bn: 'সালথা' }
        ]
      },
      {
        en: 'Gopalganj',
        bn: 'গোপালগঞ্জ',
        upazilas: [
          { en: 'Gopalganj Sadar', bn: 'গোপালগঞ্জ সদর' },
          { en: 'Kotalipara', bn: 'কোটালীপাড়া' },
          { en: 'Tungipara', bn: 'টুঙ্গিপাড়া' },
          { en: 'Kashiani', bn: 'কাশিয়ানী' },
          { en: 'Muksudpur', bn: 'মুকসুদপুর' }
        ]
      },
      {
        en: 'Madaripur',
        bn: 'মাদারীপুর',
        upazilas: [
          { en: 'Madaripur Sadar', bn: 'মাদারীপুর সদর' },
          { en: 'Rajoir', bn: 'রাজৈর' },
          { en: 'Kalkini', bn: 'কালকিনি' },
          { en: 'Shibchar', bn: 'শিবচর' },
          { en: 'Dasar', bn: 'ডাসার' }
        ]
      },
      {
        en: 'Rajbari',
        bn: 'রাজবাড়ী',
        upazilas: [
          { en: 'Rajbari Sadar', bn: 'রাজবাড়ী সদর' },
          { en: 'Pangsha', bn: 'পাংশা' },
          { en: 'Baliakandi', bn: 'বালিয়াকান্দি' },
          { en: 'Goalandaghat', bn: 'গোয়ালন্দ' },
          { en: 'Kalukhali', bn: 'কালুখালী' }
        ]
      },
      {
        en: 'Shariatpur',
        bn: 'শরীয়তপুর',
        upazilas: [
          { en: 'Shariatpur Sadar', bn: 'শরীয়তপুর সদর' },
          { en: 'Naria', bn: 'নড়িয়া' },
          { en: 'Zanjira', bn: 'জাজিরা' },
          { en: 'Damudya', bn: 'ডামুড্যা' },
          { en: 'Bhedarganj', bn: 'ভেদেরগঞ্জ' },
          { en: 'Gosairhat', bn: 'গোসাইরহাট' }
        ]
      },
      {
        en: 'Tangail',
        bn: 'টাঙ্গাইল',
        upazilas: [
          { en: 'Tangail Sadar', bn: 'টাঙ্গাইল সদর' },
          { en: 'Mirzapur', bn: 'মির্জাপুর' },
          { en: 'Kalihati', bn: 'কালিহাতী' },
          { en: 'Ghatail', bn: 'ঘাটাইল' },
          { en: 'Basail', bn: 'বাসাইল' },
          { en: 'Delduar', bn: 'দেলদুয়ার' },
          { en: 'Bhuapur', bn: 'ভূঞাপুর' },
          { en: 'Dhanbari', bn: 'ধনবাড়ী' },
          { en: 'Gopalpur', bn: 'গোপালপুর' },
          { en: 'Madhupur', bn: 'মধুপুর' },
          { en: 'Nagarpur', bn: 'নাগরপুর' },
          { en: 'Sakhipur', bn: 'সখিপুর' }
        ]
      }
    ]
  },
  {
    en: 'Chittagong',
    bn: 'চট্টগ্রাম',
    districts: [
      {
        en: 'Chittagong',
        bn: 'চট্টগ্রাম',
        upazilas: [
          { en: 'Kotwali', bn: 'কোতোয়ালী' },
          { en: 'Panchlaish', bn: 'পাঁচলাইশ' },
          { en: 'Halishahar', bn: 'হালিশহর' },
          { en: 'Double Mooring', bn: 'ডাবল মুরিং' },
          { en: 'Pahartali', bn: 'পাহাড়তলী' },
          { en: 'Khulshi', bn: 'খুলশী' },
          { en: 'Patenga', bn: 'পতেঙ্গা' },
          { en: 'Hathazari', bn: 'হাটহাজারী' },
          { en: 'Patiya', bn: 'পটিয়া' },
          { en: 'Sitakunda', bn: 'সীতাকুণ্ড' },
          { en: 'Mirsarai', bn: 'মিরসরাই' },
          { en: 'Boalkhali', bn: 'বোয়ালখালী' },
          { en: 'Anwara', bn: 'আনয়ারা' },
          { en: 'Chandanaish', bn: 'চন্দনাইশ' },
          { en: 'Banshkhali', bn: 'বাঁশখালী' },
          { en: 'Raozan', bn: 'রাউজান' },
          { en: 'Rangunia', bn: 'রাঙ্গুনিয়া' },
          { en: 'Satkania', bn: 'সাতকানিয়া' },
          { en: 'Lohagara', bn: 'লোহাগাড়া' },
          { en: 'Sandwip', bn: 'সন্দ্বীপ' }
        ]
      },
      {
        en: 'Cox\'s Bazar',
        bn: 'কক্সবাজার',
        upazilas: [
          { en: 'Cox\'s Bazar Sadar', bn: 'কক্সবাজার সদর' },
          { en: 'Ramu', bn: 'রামু' },
          { en: 'Teknaf', bn: 'টেকনাফ' },
          { en: 'Ukhiya', bn: 'উখিয়া' },
          { en: 'Chakaria', bn: 'চকরিয়া' },
          { en: 'Pekua', bn: 'পেকুয়া' },
          { en: 'Kutubdia', bn: 'কুতুবদিয়া' },
          { en: 'Maheshkhali', bn: 'মহেশখালী' }
        ]
      },
      {
        en: 'Bandarban',
        bn: 'বান্দরবান',
        upazilas: [
          { en: 'Bandarban Sadar', bn: 'বান্দরবান সদর' },
          { en: 'Thanchi', bn: 'থানচি' },
          { en: 'Ruma', bn: 'রুমা' },
          { en: 'Lama', bn: 'লামা' },
          { en: 'Alikadam', bn: 'আলীকদম' },
          { en: 'Naikhongchhari', bn: 'নাইক্ষ্যংছড়ি' },
          { en: 'Rowangchhari', bn: 'রোয়াংছড়ি' }
        ]
      },
      {
        en: 'Rangamati',
        bn: 'রাঙ্গামাটি',
        upazilas: [
          { en: 'Rangamati Sadar', bn: 'রাঙ্গামাটি সদর' },
          { en: 'Kaptai', bn: 'কাপ্তাই' },
          { en: 'Kawkhali', bn: 'কাউখালী' },
          { en: 'Baghaichhari', bn: 'বাঘাইছড়ি' },
          { en: 'Barkal', bn: 'বরকল' },
          { en: 'Langadu', bn: 'লংগদু' },
          { en: 'Naniarchar', bn: 'নানিয়ারচর' },
          { en: 'Rajasthali', bn: 'রাজস্থলী' },
          { en: 'Juraichhari', bn: 'জুরাইছড়ি' },
          { en: 'Belaichhari', bn: 'বিলাইছড়ি' }
        ]
      },
      {
        en: 'Khagrachhari',
        bn: 'খাগড়াছড়ি',
        upazilas: [
          { en: 'Khagrachhari Sadar', bn: 'খাগড়াছড়ি সদর' },
          { en: 'Dighinala', bn: 'দীঘিনালা' },
          { en: 'Panchhari', bn: 'পানছড়ি' },
          { en: 'Mahalchhari', bn: 'মহালছড়ি' },
          { en: 'Matiranga', bn: 'মাটিরাঙ্গা' },
          { en: 'Manikchhari', bn: 'মানিকছড়ি' },
          { en: 'Ramgarh', bn: 'রামগড়' },
          { en: 'Laxmichhari', bn: 'লক্ষ্মীছড়ি' }
        ]
      },
      {
        en: 'Comilla',
        bn: 'কুমিল্লা',
        upazilas: [
          { en: 'Comilla Sadar', bn: 'কুমিল্লা সদর' },
          { en: 'Daudkandi', bn: 'দাউদকান্দি' },
          { en: 'Laksham', bn: 'লাকসাম' },
          { en: 'Chandina', bn: 'চান্দিনা' },
          { en: 'Barura', bn: 'বরুড়া' },
          { en: 'Chouddagram', bn: 'চৌদ্দগ্রাম' },
          { en: 'Debidwar', bn: 'দেবিদ্বার' },
          { en: 'Homna', bn: 'হোমনা' },
          { en: 'Muradnagar', bn: 'মুরাদনগর' },
          { en: 'Nangalkot', bn: 'নাঙ্গলকোট' },
          { en: 'Titas', bn: 'তিতাস' },
          { en: 'Burichang', bn: 'বুড়িচং' },
          { en: 'Brahmanpara', bn: 'ব্রাহ্মণপাড়া' },
          { en: 'Meghna', bn: 'মেঘনা' },
          { en: 'Monohargonj', bn: 'মনোহরগঞ্জ' }
        ]
      },
      {
        en: 'Feni',
        bn: 'ফেনী',
        upazilas: [
          { en: 'Feni Sadar', bn: 'ফেনী সদর' },
          { en: 'Daganbhuiyan', bn: 'দাগনভূঞা' },
          { en: 'Chhagalnaiya', bn: 'ছাগলনাইয়া' },
          { en: 'Parshuram', bn: 'পরশুরাম' },
          { en: 'Sonagazi', bn: 'সোনাগাজী' },
          { en: 'Fulgazi', bn: 'ফুলগাজী' }
        ]
      },
      {
        en: 'Noakhali',
        bn: 'নোয়াখালী',
        upazilas: [
          { en: 'Noakhali Sadar', bn: 'নোয়াখালী সদর' },
          { en: 'Begumganj', bn: 'বেগমগঞ্জ' },
          { en: 'Senbagh', bn: 'সেনবাগ' },
          { en: 'Chatkhil', bn: 'চাটখিল' },
          { en: 'Companiganj', bn: 'কোম্পানীগঞ্জ' },
          { en: 'Hatiya', bn: 'হাতিয়া' },
          { en: 'Subarnachar', bn: 'সুবর্ণচর' },
          { en: 'Kabirhat', bn: 'কবীরহাট' },
          { en: 'Sonaimuri', bn: 'সোনাইমুড়ী' }
        ]
      },
      {
        en: 'Lakshmipur',
        bn: 'লক্ষ্মীপুর',
        upazilas: [
          { en: 'Lakshmipur Sadar', bn: 'লক্ষ্মীপুর সদর' },
          { en: 'Raipur', bn: 'রায়পুর' },
          { en: 'Ramganj', bn: 'রামগঞ্জ' },
          { en: 'Ramgati', bn: 'রামগতি' },
          { en: 'Kamalnagar', bn: 'কমলনগর' }
        ]
      },
      {
        en: 'Chandpur',
        bn: 'চাঁদপুর',
        upazilas: [
          { en: 'Chandpur Sadar', bn: 'চাঁদপুর সদর' },
          { en: 'Hajiganj', bn: 'হাাজীগঞ্জ' },
          { en: 'Faridganj', bn: 'ফরিদগঞ্জ' },
          { en: 'Matlab North', bn: 'মতলব উত্তর' },
          { en: 'Matlab South', bn: 'মতলব দক্ষিণ' },
          { en: 'Kachua', bn: 'কচুয়া' },
          { en: 'Shahrasti', bn: 'শাহরাস্তি' },
          { en: 'Haimchar', bn: 'হাইমচর' }
        ]
      },
      {
        en: 'Brahmanbaria',
        bn: 'ব্রাহ্মণবাড়িয়া',
        upazilas: [
          { en: 'Brahmanbaria Sadar', bn: 'ব্রাহ্মণবাড়িয়া সদর' },
          { en: 'Ashuganj', bn: 'আশুগঞ্জ' },
          { en: 'Bancharampur', bn: 'বাঞ্ছারামপুর' },
          { en: 'Kasba', bn: 'কসবা' },
          { en: 'Nabinagar', bn: 'নবীনগর' },
          { en: 'Nasirnagar', bn: 'নাসিরনগর' },
          { en: 'Sarail', bn: 'সরাইল' },
          { en: 'Akhaura', bn: 'আখাউড়া' },
          { en: 'Bijoynagar', bn: 'বিজয়নগর' }
        ]
      }
    ]
  },
  {
    en: 'Rajshahi',
    bn: 'রাজশাহী',
    districts: [
      {
        en: 'Rajshahi',
        bn: 'রাজশাহী',
        upazilas: [
          { en: 'Boalia', bn: 'বোয়ালিয়া' },
          { en: 'Rajpara', bn: 'রাজপাড়া' },
          { en: 'Motihar', bn: 'মতিহার' },
          { en: 'Shah Makhdum', bn: 'শাহ মখদুম' },
          { en: 'Paba', bn: 'পবা' },
          { en: 'Godagari', bn: 'গোদাগাড়ী' },
          { en: 'Tanore', bn: 'তানোর' },
          { en: 'Mohanpur', bn: 'মোহনপুর' },
          { en: 'Bagmara', bn: 'বাগমারা' },
          { en: 'Durgapur', bn: 'দুর্গাপুর' },
          { en: 'Puthia', bn: 'পুঠিয়া' },
          { en: 'Charghat', bn: 'চারঘাট' },
          { en: 'Bagha', bn: 'বাঘা' }
        ]
      },
      {
        en: 'Bogra',
        bn: 'বগুড়া',
        upazilas: [
          { en: 'Bogra Sadar', bn: 'বগুড়া সদর' },
          { en: 'Sherpur', bn: 'শেরপুর' },
          { en: 'Shajahanpur', bn: 'শাহজাহানপুর' },
          { en: 'Shibganj', bn: 'শিবগঞ্জ' },
          { en: 'Gabtali', bn: 'গাবতলী' },
          { en: 'Kahaloo', bn: 'কাহালু' },
          { en: 'Nandigram', bn: 'নন্দীগ্রাম' },
          { en: 'Dhunat', bn: 'ধুনট' },
          { en: 'Sariakandi', bn: 'সারিয়াকান্দি' },
          { en: 'Sonatala', bn: 'সোনাতলা' },
          { en: 'Dupchanchia', bn: 'দুপচাঁচিয়া' },
          { en: 'Adamdighi', bn: 'আদমদীঘি' }
        ]
      },
      {
        en: 'Joypurhat',
        bn: 'জয়পুরহাট',
        upazilas: [
          { en: 'Joypurhat Sadar', bn: 'জয়পুরহাট সদর' },
          { en: 'Akkelpur', bn: 'আক্কেলপুর' },
          { en: 'Kalai', bn: 'কালাই' },
          { en: 'Khetlal', bn: 'খেতলাল' },
          { en: 'Panchbibi', bn: 'পাঁচবিবি' }
        ]
      },
      {
        en: 'Naogaon',
        bn: 'নওগাঁ',
        upazilas: [
          { en: 'Naogaon Sadar', bn: 'নওগাঁ সদর' },
          { en: 'Badalgachhi', bn: 'বদলগাছী' },
          { en: 'Dhamoirhat', bn: 'ধামইরহাট' },
          { en: 'Manda', bn: 'মান্দা' },
          { en: 'Mahadevpur', bn: 'মহাদেবপুর' },
          { en: 'Niamatpur', bn: ' নিয়ামতপুর' },
          { en: 'Patnitala', bn: 'পত্নীতলা' },
          { en: 'Porsha', bn: 'পোরশা' },
          { en: 'Raninagar', bn: 'রাণীনগর' },
          { en: 'Sapahar', bn: 'সাপাহার' },
          { en: 'Atrai', bn: 'আত্রাই' }
        ]
      },
      {
        en: 'Natore',
        bn: 'নাটোর',
        upazilas: [
          { en: 'Natore Sadar', bn: 'নাটোর সদর' },
          { en: 'Baraigram', bn: 'বড়াইগ্রাম' },
          { en: 'Gurudaspur', bn: 'গুরুদাসপুর' },
          { en: 'Lalpur', bn: 'লালপুর' },
          { en: 'Singra', bn: 'সিংড়া' },
          { en: 'Bagatipara', bn: 'বাগাতিপাড়া' },
          { en: 'Naldanga', bn: 'নলডাঙ্গা' }
        ]
      },
      {
        en: 'Chapai Nawabganj',
        bn: 'চাঁপাইনবাবগঞ্জ',
        upazilas: [
          { en: 'Chapai Nawabganj Sadar', bn: 'চাঁপাইনবাবগঞ্জ সদর' },
          { en: 'Shibganj', bn: 'শিবগঞ্জ' },
          { en: 'Gomastapur', bn: 'গোমস্তাপুর' },
          { en: 'Nachole', bn: 'নাচোল' },
          { en: 'Bholahat', bn: 'ভোলাহাট' }
        ]
      },
      {
        en: 'Pabna',
        bn: 'পাবনা',
        upazilas: [
          { en: 'Pabna Sadar', bn: 'পাবনা সদর' },
          { en: 'Ishwardi', bn: 'ঈশ্বরদী' },
          { en: 'Santhia', bn: 'সাঁথিয়া' },
          { en: 'Sujanagar', bn: 'সুজানগর' },
          { en: 'Bhangoora', bn: 'ভাঙ্গুড়া' },
          { en: 'Chatmohar', bn: 'চাটমোহর' },
          { en: 'Faridpur', bn: 'ফরিদপুর' },
          { en: 'Bera', bn: 'বেড়া' },
          { en: 'Atgharia', bn: 'আটঘরিয়া' }
        ]
      },
      {
        en: 'Sirajganj',
        bn: 'সিরাজগঞ্জ',
        upazilas: [
          { en: 'Sirajganj Sadar', bn: 'সিরাজগঞ্জ সদর' },
          { en: 'Belkuchi', bn: 'বেলকুচি' },
          { en: 'Chauhali', bn: 'চৌহালী' },
          { en: 'Kamarkhanda', bn: 'কামারখন্দ' },
          { en: 'Kazipur', bn: 'কাজীপুর' },
          { en: 'Rayganj', bn: 'রায়গঞ্জ' },
          { en: 'Shahjadpur', bn: 'শাহজাদপুর' },
          { en: 'Tarash', bn: 'তাড়াশ' },
          { en: 'Ullahpara', bn: 'উল্লাপাড়া' }
        ]
      }
    ]
  },
  {
    en: 'Khulna',
    bn: 'খুলনা',
    districts: [
      {
        en: 'Khulna',
        bn: 'খুলনা',
        upazilas: [
          { en: 'Sonadanga', bn: 'সোনাডাঙ্গা' },
          { en: 'Khalishpur', bn: 'খালিশপুর' },
          { en: 'Daulatpur', bn: 'দৌলতপুর' },
          { en: 'Khan Jahan Ali', bn: 'খান জাহান আলী' },
          { en: 'Kotwali', bn: 'কোতোয়ালী' },
          { en: 'Rupsha', bn: 'রূপসা' },
          { en: 'Batiaghata', bn: 'বটিয়াঘাটা' },
          { en: 'Dacope', bn: 'দাকোপ' },
          { en: 'Dumuria', bn: 'ডুমুরিয়া' },
          { en: 'Dighalia', bn: 'দিঘলিয়া' },
          { en: 'Koyra', bn: 'কয়রা' },
          { en: 'Paikgachha', bn: 'পাইকগাছা' },
          { en: 'Phultala', bn: 'ফুলতলা' },
          { en: 'Terokhada', bn: 'তেরখাদা' }
        ]
      },
      {
        en: 'Bagerhat',
        bn: 'বাগেরহাট',
        upazilas: [
          { en: 'Bagerhat Sadar', bn: 'বাগেরহাট সদর' },
          { en: 'Mongla', bn: 'মোংলা' },
          { en: 'Chitalmari', bn: 'চিতলমারী' },
          { en: 'Fakirhat', bn: 'ফকিরহাট' },
          { en: 'Kachua', bn: 'কচুয়া' },
          { en: 'Mollahat', bn: 'মোল্লাহাট' },
          { en: 'Morrelganj', bn: 'মোড়েলগঞ্জ' },
          { en: 'Rampal', bn: 'রামপাল' },
          { en: 'Sarankhola', bn: 'শরণখোলা' }
        ]
      },
      {
        en: 'Chuadanga',
        bn: 'চুয়াডাঙ্গা',
        upazilas: [
          { en: 'Chuadanga Sadar', bn: 'চুয়াডাঙ্গা সদর' },
          { en: 'Alamdanga', bn: 'আলমডাঙ্গা' },
          { en: 'Damurhuda', bn: 'দামুড়হুদা' },
          { en: 'Jibannagar', bn: 'জীবননগর' }
        ]
      },
      {
        en: 'Jessore',
        bn: 'যশোর',
        upazilas: [
          { en: 'Jessore Sadar', bn: 'যশোর সদর' },
          { en: 'Abhaynagar', bn: 'অভয়নগর' },
          { en: 'Bagherpara', bn: 'বাঘারপাড়া' },
          { en: 'Chaugachha', bn: 'চৌগাছা' },
          { en: 'Jhikargachha', bn: 'ঝিকরগাছা' },
          { en: 'Keshabpur', bn: 'কেশবপুর' },
          { en: 'Manirampur', bn: 'মনিরামপুর' },
          { en: 'Sharsha', bn: 'শার্শা' }
        ]
      },
      {
        en: 'Jhenaidah',
        bn: 'ঝিনাইদহ',
        upazilas: [
          { en: 'Jhenaidah Sadar', bn: 'ঝিনাইদহ সদর' },
          { en: 'Harinakundu', bn: 'হরিণাকুণ্ডু' },
          { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
          { en: 'Kotchandpur', bn: 'কোটচাঁদপুর' },
          { en: 'Maheshpur', bn: 'মহেশপুর' },
          { en: 'Shailkupa', bn: 'শৈলকূপা' }
        ]
      },
      {
        en: 'Kushtia',
        bn: 'কুষ্টিয়া',
        upazilas: [
          { en: 'Kushtia Sadar', bn: 'কুষ্টিয়া সদর' },
          { en: 'Bheramara', bn: 'ভেড়ামারা' },
          { en: 'Daulatpur', bn: 'দৌলতপুর' },
          { en: 'Khoksa', bn: 'খোকসা' },
          { en: 'Kumarkhali', bn: 'কুমারখালী' },
          { en: 'Mirpur', bn: 'মিরপুর' }
        ]
      },
      {
        en: 'Magura',
        bn: 'মাগুরা',
        upazilas: [
          { en: 'Magura Sadar', bn: 'মাগুরা সদর' },
          { en: 'Mohammadpur', bn: 'মোহাম্মদপুর' },
          { en: 'Shalikha', bn: 'শালিখা' },
          { en: 'Sreepur', bn: 'শ্রীপুর' }
        ]
      },
      {
        en: 'Meherpur',
        bn: 'মেহেরপুর',
        upazilas: [
          { en: 'Meherpur Sadar', bn: 'মেহেরপুর সদর' },
          { en: 'Gangni', bn: 'গাংনী' },
          { en: 'Mujibnagar', bn: 'মুজিবনগর' }
        ]
      },
      {
        en: 'Narail',
        bn: 'নড়াইল',
        upazilas: [
          { en: 'Narail Sadar', bn: 'নড়াইল সদর' },
          { en: 'Kalia', bn: 'কালিয়া' },
          { en: 'Lohagara', bn: 'লোহাগড়া' }
        ]
      },
      {
        en: 'Satkhira',
        bn: 'সাতক্ষীরা',
        upazilas: [
          { en: 'Satkhira Sadar', bn: 'সাতক্ষীরা সদর' },
          { en: 'Assasuni', bn: 'আশাশুনি' },
          { en: 'Debhata', bn: 'দেবহাটা' },
          { en: 'Kalaroa', bn: 'কলারোয়া' },
          { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
          { en: 'Shyamnagar', bn: 'শ্যামনগর' },
          { en: 'Tala', bn: 'তালা' }
        ]
      }
    ]
  },
  {
    en: 'Barisal',
    bn: 'বরিশাল',
    districts: [
      {
        en: 'Barisal',
        bn: 'বরিশাল',
        upazilas: [
          { en: 'Barisal Sadar', bn: 'বরিশাল সদর' },
          { en: 'Babuganj', bn: 'বাবুগঞ্জ' },
          { en: 'Bakerganj', bn: 'বাকেরগঞ্জ' },
          { en: 'Banaripara', bn: 'বানারীপাড়া' },
          { en: 'Gaurnadi', bn: 'গৌরনদী' },
          { en: 'Hijla', bn: 'হিজলা' },
          { en: 'Mehendiganj', bn: 'মেহেন্দিগঞ্জ' },
          { en: 'Muladi', bn: 'মুলাদী' },
          { en: 'Wazirpur', bn: 'উজিরপুর' },
          { en: 'Agailjhara', bn: 'আগৈলঝাড়া' }
        ]
      },
      {
        en: 'Barguna',
        bn: 'বরগুনা',
        upazilas: [
          { en: 'Barguna Sadar', bn: 'বরগুনা সদর' },
          { en: 'Amatali', bn: 'আমতলী' },
          { en: 'Bamna', bn: 'বামনা' },
          { en: 'Betagi', bn: 'বেতাগী' },
          { en: 'Patharghata', bn: 'পাথরঘাটা' },
          { en: 'Taltali', bn: 'তালতলী' }
        ]
      },
      {
        en: 'Bhola',
        bn: 'ভোলা',
        upazilas: [
          { en: 'Bhola Sadar', bn: 'ভোলা সদর' },
          { en: 'Burhanuddin', bn: 'বোরহানউদ্দিন' },
          { en: 'Char Fasson', bn: 'চরফ্যাশন' },
          { en: 'Daulatkhan', bn: 'দৌলতখান' },
          { en: 'Lalmohan', bn: 'লালমোহন' },
          { en: 'Manpura', bn: 'মনপুরা' },
          { en: 'Tazumuddin', bn: 'তাজুমদ্দিন' }
        ]
      },
      {
        en: 'Jhalokati',
        bn: 'ঝালকাঠি',
        upazilas: [
          { en: 'Jhalokati Sadar', bn: 'ঝালকাঠি সদর' },
          { en: 'Kathalia', bn: 'কাঁঠালিয়া' },
          { en: 'Nalchity', bn: 'নলছিটি' },
          { en: 'Rajapur', bn: 'রাজাপুর' }
        ]
      },
      {
        en: 'Patuakhali',
        bn: 'পটুয়াখালী',
        upazilas: [
          { en: 'Patuakhali Sadar', bn: 'পটুয়াখালী সদর' },
          { en: 'Bauphal', bn: 'বাউফল' },
          { en: 'Dashmina', bn: 'দশমিনা' },
          { en: 'Galachipa', bn: 'গলাচিপা' },
          { en: 'Kalapara', bn: 'কলাপাড়া' },
          { en: 'Mirzaganj', bn: 'মির্জাগঞ্জ' },
          { en: 'Dumki', bn: 'দুমকি' },
          { en: 'Rangabali', bn: 'রাঙ্গাবালী' }
        ]
      },
      {
        en: 'Pirojpur',
        bn: 'পিরোজপুর',
        upazilas: [
          { en: 'Pirojpur Sadar', bn: 'পিরোজপুর সদর' },
          { en: 'Bhandaria', bn: 'ভান্ডারিয়া' },
          { en: 'Mathbaria', bn: 'মঠবাড়িয়া' },
          { en: 'Nazirpur', bn: 'নাজিরপুর' },
          { en: 'Nesarabad (Swarupkati)', bn: 'নেছারাবাদ (স্বরূপকাঠি)' },
          { en: 'Kawkhali', bn: 'কাউখালী' },
          { en: 'Indurkani', bn: 'ইন্দুরকানী' }
        ]
      }
    ]
  },
  {
    en: 'Sylhet',
    bn: 'সিলেট',
    districts: [
      {
        en: 'Sylhet',
        bn: 'সিলেট',
        upazilas: [
          { en: 'Sylhet Sadar', bn: 'সিলেট সদর' },
          { en: 'Zindabazar', bn: 'জিন্দাবাজার' },
          { en: 'Beanibazar', bn: 'বিয়ানীবাজার' },
          { en: 'Bishwanath', bn: 'বিশ্বনাথ' },
          { en: 'Companiganj', bn: 'কোম্পানীগঞ্জ' },
          { en: 'Fenchuganj', bn: 'ফেঞ্চুগঞ্জ' },
          { en: 'Golapganj', bn: 'গোলাপগঞ্জ' },
          { en: 'Gowainghat', bn: 'গোয়াইনঘাট' },
          { en: 'Jaintiapur', bn: 'জৈন্তাপুর' },
          { en: 'Kanaighat', bn: 'কানাইঘাট' },
          { en: 'Zakiganj', bn: 'জকিগঞ্জ' },
          { en: 'Balaganj', bn: 'বালাগঞ্জ' },
          { en: 'Osmaninagar', bn: 'ওসমানীনগর' }
        ]
      },
      {
        en: 'Habiganj',
        bn: 'হবিগঞ্জ',
        upazilas: [
          { en: 'Habiganj Sadar', bn: 'হবিগঞ্জ সদর' },
          { en: 'Ajmiriganj', bn: 'আজমিরীগঞ্জ' },
          { en: 'Bahubal', bn: 'বাহুবল' },
          { en: 'Baniya Chang', bn: 'বানিয়াচং' },
          { en: 'Chunarughat', bn: 'চুনারুঘাট' },
          { en: 'Lakhai', bn: 'লাখাই' },
          { en: 'Madhabpur', bn: 'মাধবপুর' },
          { en: 'Nabiganj', bn: 'নবীগঞ্জ' },
          { en: 'Shayestaganj', bn: 'শায়েস্তাগঞ্জ' }
        ]
      },
      {
        en: 'Moulvibazar',
        bn: 'মৌলভীবাজার',
        upazilas: [
          { en: 'Moulvibazar Sadar', bn: 'মৌলভীবাজার সদর' },
          { en: 'Barlekha', bn: 'বড়লেখা' },
          { en: 'Kamalganj', bn: 'কমলগঞ্জ' },
          { en: 'Kulaura', bn: 'কুলাউড়া' },
          { en: 'Rajnagar', bn: 'রাজনগর' },
          { en: 'Sreemangal', bn: 'শ্রীমঙ্গল' },
          { en: 'Juri', bn: 'জুড়ী' }
        ]
      },
      {
        en: 'Sunamganj',
        bn: 'সুনামগঞ্জ',
        upazilas: [
          { en: 'Sunamganj Sadar', bn: 'সুনামগঞ্জ সদর' },
          { en: 'Bishwamambharpur', bn: 'বিশ্বম্ভরপুর' },
          { en: 'Chhatak', bn: 'ছাতক' },
          { en: 'Derai', bn: 'দিরাই' },
          { en: 'Dharamapasha', bn: 'ধর্মপাশা' },
          { en: 'Dowarabazar', bn: 'দোয়ারাবাজার' },
          { en: 'Jagannathpur', bn: 'জগন্নাথপুর' },
          { en: 'Jamalganj', bn: 'জামালগঞ্জ' },
          { en: 'Sullah', bn: 'শাল্লা' },
          { en: 'Tahirpur', bn: 'তাহিরপুর' },
          { en: 'Shantiganj', bn: 'শান্তিগঞ্জ' }
        ]
      }
    ]
  },
  {
    en: 'Rangpur',
    bn: 'রংপুর',
    districts: [
      {
        en: 'Rangpur',
        bn: 'রংপুর',
        upazilas: [
          { en: 'Rangpur Sadar', bn: 'রংপুর সদর' },
          { en: 'Badarganj', bn: 'বদরগঞ্জ' },
          { en: 'Gangachhara', bn: 'গঙ্গাচড়া' },
          { en: 'Kaunia', bn: 'কাউনিয়া' },
          { en: 'Mithapukur', bn: 'মিঠাপুকুর' },
          { en: 'Pirgachha', bn: 'পীরগাছা' },
          { en: 'Pirganj', bn: 'পীরগঞ্জ' },
          { en: 'Taraganj', bn: 'তারাগঞ্জ' }
        ]
      },
      {
        en: 'Dinajpur',
        bn: 'দিনাজপুর',
        upazilas: [
          { en: 'Dinajpur Sadar', bn: 'দিনাজপুর সদর' },
          { en: 'Birampur', bn: 'বিরামপুর' },
          { en: 'Birganj', bn: 'বীরগঞ্জ' },
          { en: 'Biral', bn: 'বিরল' },
          { en: 'Bochaganj', bn: 'বোচাগঞ্জ' },
          { en: 'Chirirbandar', bn: 'চিরিরবন্দর' },
          { en: 'Phulbari', bn: 'ফুলবাড়ী' },
          { en: 'Ghoraghat', bn: 'ঘোড়াঘাট' },
          { en: 'Hakimpur', bn: 'হাকিমপুর' },
          { en: 'Kaharole', bn: 'কাহারোল' },
          { en: 'Khansama', bn: 'খানসামা' },
          { en: 'Nawabganj', bn: 'নবাবগঞ্জ' },
          { en: 'Parbatipur', bn: 'পার্বতীপুর' }
        ]
      },
      {
        en: 'Gaibandha',
        bn: 'গাইবান্ধা',
        upazilas: [
          { en: 'Gaibandha Sadar', bn: 'গাইবান্ধা সদর' },
          { en: 'Phulchhari', bn: 'ফুলছড়ি' },
          { en: 'Gobindaganj', bn: 'গোবিন্দগঞ্জ' },
          { en: 'Palashbari', bn: 'পলাশবাড়ী' },
          { en: 'Sadullapur', bn: 'সাদুল্লাপুর' },
          { en: 'Sughatta', bn: 'সাঘাটা' },
          { en: 'Sundarganj', bn: 'সুন্দরগঞ্জ' }
        ]
      },
      {
        en: 'Kurigram',
        bn: 'কুড়িগ্রাম',
        upazilas: [
          { en: 'Kurigram Sadar', bn: 'কুড়িগ্রাম সদর' },
          { en: 'Bhurungamari', bn: 'ভুরুঙ্গামারী' },
          { en: 'Char Rajibpur', bn: 'চর রাজিবপুর' },
          { en: 'Chilmari', bn: 'চিলমারী' },
          { en: 'Phulbari', bn: 'ফুলবাড়ী' },
          { en: 'Nageshwari', bn: 'নাগেশ্বরী' },
          { en: 'Rajarhat', bn: 'রাজারহাট' },
          { en: 'Raomari', bn: 'রৌমারী' },
          { en: 'Ulipur', bn: 'উলিপুর' }
        ]
      },
      {
        en: 'Lalmonirhat',
        bn: 'লালমনিরহাট',
        upazilas: [
          { en: 'Lalmonirhat Sadar', bn: 'লালমনিরহাট সদর' },
          { en: 'Aditmari', bn: 'আদিতমারী' },
          { en: 'Hatibandha', bn: 'হাতিবান্ধা' },
          { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
          { en: 'Patgram', bn: 'পাটগ্রাম' }
        ]
      },
      {
        en: 'Nilphamari',
        bn: 'নীলফামারী',
        upazilas: [
          { en: 'Nilphamari Sadar', bn: 'নীলফামারী সদর' },
          { en: 'Dimla', bn: 'ডিমলা' },
          { en: 'Domar', bn: 'ডোমার' },
          { en: 'Jaldhaka', bn: 'জলঢাকা' },
          { en: 'Kishoreganj', bn: 'কিশোরগঞ্জ' },
          { en: 'Syedpur', bn: 'সৈয়দপুর' }
        ]
      },
      {
        en: 'Panchagarh',
        bn: 'পঞ্চগড়',
        upazilas: [
          { en: 'Panchagarh Sadar', bn: 'পঞ্চগড় সদর' },
          { en: 'Atwari', bn: 'আটোয়ারী' },
          { en: 'Boda', bn: 'বোদা' },
          { en: 'Debi Ganj', bn: 'দেবীগঞ্জ' },
          { en: 'Tetulia', bn: 'তেঁতুলিয়া' }
        ]
      },
      {
        en: 'Thakurgaon',
        bn: 'ঠাকুরগাঁও',
        upazilas: [
          { en: 'Thakurgaon Sadar', bn: 'ঠাকুরগাঁও সদর' },
          { en: 'Baliadangi', bn: 'বালিয়াডাঙ্গী' },
          { en: 'Haripur', bn: 'হরিপুর' },
          { en: 'Pirganj', bn: 'পীরগঞ্জ' },
          { en: 'Ranisankail', bn: 'রাণীশংকৈল' }
        ]
      }
    ]
  },
  {
    en: 'Mymensingh',
    bn: 'ময়মনসিংহ',
    districts: [
      {
        en: 'Mymensingh',
        bn: 'ময়মনসিংহ',
        upazilas: [
          { en: 'Mymensingh Sadar', bn: 'ময়মনসিংহ সদর' },
          { en: 'Bhaluka', bn: 'ভালুকা' },
          { en: 'Dhobaura', bn: 'ধোবাউড়া' },
          { en: 'Fulbaria', bn: 'ফুলবাড়ীয়া' },
          { en: 'Gafargaon', bn: 'গফরগাঁও' },
          { en: 'Gauripur', bn: 'গৌরীপুর' },
          { en: 'Haluaghat', bn: 'হালুয়াঘাট' },
          { en: 'Ishwarganj', bn: 'ঈশ্বরগঞ্জ' },
          { en: 'Muktagachha', bn: 'মুক্তাগাছা' },
          { en: 'Nandail', bn: 'নান্দাইল' },
          { en: 'Phulpur', bn: 'ফুলপুর' },
          { en: 'Trishal', bn: 'ত্রিশাল' },
          { en: 'Tara Khanda', bn: 'তারাকান্দা' }
        ]
      },
      {
        en: 'Jamalpur',
        bn: 'জামালপুর',
        upazilas: [
          { en: 'Jamalpur Sadar', bn: 'জামালপুর সদর' },
          { en: 'Baksiganj', bn: 'বকশীগঞ্জ' },
          { en: 'Dewanganj', bn: 'দেওয়ানগঞ্জ' },
          { en: 'Islampur', bn: 'ইসলামপুর' },
          { en: 'Madarganj', bn: 'মাদারগঞ্জ' },
          { en: 'Melandaha', bn: 'মেলান্দহ' },
          { en: 'Sarishabari', bn: 'সরিষাবাড়ী' }
        ]
      },
      {
        en: 'Netrokona',
        bn: 'নেত্রকোণা',
        upazilas: [
          { en: 'Netrokona Sadar', bn: 'নেত্রকোণা সদর' },
          { en: 'Atpara', bn: 'আটপাড়া' },
          { en: 'Barhatta', bn: 'বারহাট্টা' },
          { en: 'Durgapur', bn: 'দুর্গাপুর' },
          { en: 'Kalmakanda', bn: 'কলমাকান্দা' },
          { en: 'Kendua', bn: 'কেন্দুয়া' },
          { en: 'Madan', bn: 'মদন' },
          { en: 'Mohanganj', bn: 'মোহনগঞ্জ' },
          { en: 'Purbadhala', bn: 'পূর্বধলা' },
          { en: 'Khaliajuri', bn: 'খালিয়াজুরী' }
        ]
      },
      {
        en: 'Sherpur',
        bn: 'শেরপুর',
        upazilas: [
          { en: 'Sherpur Sadar', bn: 'শেরপুর সদর' },
          { en: 'Jhenaigati', bn: 'ঝিনাইগাতী' },
          { en: 'Nakla', bn: 'নকলা' },
          { en: 'Nalitabari', bn: 'নালিতাবাড়ী' },
          { en: 'Sreebardi', bn: 'শ্রীবরদী' }
        ]
      }
    ]
  }
];

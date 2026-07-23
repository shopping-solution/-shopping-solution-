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
          { en: 'Savar', bn: 'সাভার' },
          { en: 'Keraniganj', bn: 'কেরানীগঞ্জ' }
        ]
      },
      {
        en: 'Gazipur',
        bn: 'গাজীপুর',
        upazilas: [
          { en: 'Gazipur Sadar', bn: 'গাজীপুর সদর' },
          { en: 'Kaliakair', bn: 'কালিয়াকৈর' },
          { en: 'Sreepur', bn: 'শ্রীপুর' },
          { en: 'Kapasia', bn: 'কাপাসিয়া' }
        ]
      },
      {
        en: 'Narayanganj',
        bn: 'নারায়ণগঞ্জ',
        upazilas: [
          { en: 'Narayanganj Sadar', bn: 'নারায়ণগঞ্জ সদর' },
          { en: 'Siddhirganj', bn: 'সিদ্ধিরগঞ্জ' },
          { en: 'Rupganj', bn: 'রূপগঞ্জ' },
          { en: 'Araihazar', bn: 'আড়াইহাজার' }
        ]
      },
      {
        en: 'Tangail',
        bn: 'টাঙ্গাইল',
        upazilas: [
          { en: 'Tangail Sadar', bn: 'টাঙ্গাইল সদর' },
          { en: 'Mirzapur', bn: 'মির্জাপুর' },
          { en: 'Kalihati', bn: 'কালিহাতী' }
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
          { en: 'Panchlaish', bn: 'পাঁচলাইশ' },
          { en: 'Kotwali', bn: 'কোতোয়ালী' },
          { en: 'Halishahar', bn: 'হালিশহর' },
          { en: 'Hathazari', bn: 'হাটহাজারী' },
          { en: 'Patiya', bn: 'পটিয়া' }
        ]
      },
      {
        en: 'Cox\'s Bazar',
        bn: 'কক্সবাজার',
        upazilas: [
          { en: 'Cox\'s Bazar Sadar', bn: 'কক্সবাজার সদর' },
          { en: 'Ramoo', bn: 'রামু' },
          { en: 'Teknaf', bn: 'টেকনাফ' }
        ]
      },
      {
        en: 'Comilla',
        bn: 'কুমিল্লা',
        upazilas: [
          { en: 'Comilla Sadar', bn: 'কুমিল্লা সদর' },
          { en: 'Daudkandi', bn: 'দাউদকান্দি' },
          { en: 'Laksham', bn: 'লাকসাম' }
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
          { en: 'Paba', bn: 'পবা' }
        ]
      },
      {
        en: 'Bogra',
        bn: 'বগুড়া',
        upazilas: [
          { en: 'Bogra Sadar', bn: 'বগুড়া সদর' },
          { en: 'Sherpur', bn: 'শেরপুর' },
          { en: 'Shajahanpur', bn: 'শাহজাহানপুর' }
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
          { en: 'Khalishpur', bn: 'খালিাশপুর' },
          { en: 'Rupsha', bn: 'রূপসা' }
        ]
      },
      {
        en: 'Jessore',
        bn: 'যশোর',
        upazilas: [
          { en: 'Jessore Sadar', bn: 'যশোর সদর' },
          { en: 'Jhikargachha', bn: 'ঝিকরগাছা' }
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
          { en: 'Beanibazar', bn: 'বিয়ানীবাজার' }
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
          { en: 'Gournadi', bn: 'গৌরনদী' }
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
          { en: 'Pirganj', bn: 'পীরগঞ্জ' }
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
          { en: 'Muktagachha', bn: 'মুক্তাগাছা' }
        ]
      }
    ]
  }
];

import { faker } from '@faker-js/faker';

type DynamicVariableFunction = () => string;

// Custom username generator function
const generateUsername = (): string => {
  const patterns = [
    // firstName + random number
    () => `${faker.person.firstName().toLowerCase()}${faker.number.int({ min: 1, max: 999 })}`,
    // firstName + lastName
    () => `${faker.person.firstName().toLowerCase()}_${faker.person.lastName().toLowerCase()}`,
    // firstName initial + lastName + random number
    () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${faker.number.int({ min: 1, max: 99 })}`;
    },
    // random word + random number
    () => `${faker.word.sample().toLowerCase()}${faker.number.int({ min: 1, max: 999 })}`,
    // two random words
    () => `${faker.word.sample().toLowerCase()}_${faker.word.sample().toLowerCase()}`
  ];

  // Randomly select a pattern
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return randomPattern();
};

const dynamicVariables: Record<string, DynamicVariableFunction> = {
  // Random Names
  $randomFirstName: () => faker.person.firstName(),
  $randomLastName: () => faker.person.lastName(),
  $randomFullName: () => faker.person.fullName(),
  $randomUserName: generateUsername,

  // Random Internet
  $randomEmail: () => faker.internet.email(),
  $randomUrl: () => faker.internet.url(),
  $randomIP: () => faker.internet.ip(),
  $randomIPv6: () => faker.internet.ipv6(),
  $randomPassword: () => faker.internet.password(),
  $randomDomainName: () => faker.internet.domainName(),

  // Random Numbers
  $randomInt: () => faker.number.int({ min: 1, max: 1000 }).toString(),
  $randomFloat: () => faker.number.float({ min: 1, max: 1000 }).toString(),
  $randomPhoneNumber: () => faker.phone.number(),

  // Random Dates
  $timestamp: () => Date.now().toString(),
  $isoTimestamp: () => new Date().toISOString(),
  $randomDate: () => faker.date.recent().toISOString(),
  $randomFutureDate: () => faker.date.future().toISOString(),
  $randomPastDate: () => faker.date.past().toISOString(),

  // Random Text
  $randomWord: () => faker.word.sample(),
  $randomWords: () => faker.word.words(3),
  $randomSentence: () => faker.lorem.sentence(),
  $randomParagraph: () => faker.lorem.paragraph(),

  // Random Data
  $randomUUID: () => faker.string.uuid(),
  $randomHexColor: () => faker.color.rgb({ format: 'hex' }),
  $randomRgbColor: () => faker.color.rgb(),
  $randomBoolean: () => faker.datatype.boolean().toString(),

  // Random Location
  $randomCity: () => faker.location.city(),
  $randomCountry: () => faker.location.country(),
  $randomLatitude: () => faker.location.latitude().toString(),
  $randomLongitude: () => faker.location.longitude().toString(),
  $randomZipCode: () => faker.location.zipCode(),

  // Random Business
  $randomCompanyName: () => faker.company.name(),
  $randomJobTitle: () => faker.person.jobTitle(),
  $randomPrice: () => faker.commerce.price().toString(),
  $randomProduct: () => faker.commerce.product(),
};

export const processDynamicVariables = (text: string): string => {
  return text.replace(/\$[a-zA-Z]+/g, (match) => {
    const variableFunction = dynamicVariables[match];
    if (variableFunction) {
      try {
        return variableFunction();
      } catch (error) {
        console.error(`Error generating value for ${match}:`, error);
        return match;
      }
    }
    return match;
  });
};

export const getDynamicVariablesList = (): string[] => {
  return Object.keys(dynamicVariables);
}; 
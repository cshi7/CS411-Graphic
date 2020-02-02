#include <iostream>
#include "ConsoleRender.h"

void main()
{
	CR cr1 = createCR(5, 3);
	setCR(cr1, 0, 0, "Hello");
	setCR(cr1, 0, 0, "¡ñ");
	setCR(cr1, 0, 2, "¡ñ¡ñ¡ñ¡ñ¡ñ");
	renderCR(cr1);

	std::cout<<std::endl;

	CR cr2 = createCR(8, 5);
	setCR(cr2, 0, 0, "Hello");
	setCR(cr2, 0, 0, "¡ñ");
	setCR(cr2, 0, 2, "¡ñ¡ñ¡ñ¡ñ¡ñ");
	renderCR(cr2);

	std::cout<<std::endl;

	renderCR(cr1);

	destroyCR(cr1);
	destroyCR(cr2);

	system("pause");
}
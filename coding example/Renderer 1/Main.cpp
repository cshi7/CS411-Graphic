#include <iostream>
#include "ConsoleRender.h"

void f(CR cr)
{
	char s[] = "Hello";
	setCR(cr, 1, 1, s);
}

void main()
{
	CR cr = createCR(3, 2);

	f(cr);

	renderCR(cr);

	system("pause");
}